(function(){
	$.mobile.Censo = {
			dbName : 'Encuestas',
			dbVersion : '1.0',
			dbDisplayName : 'Agricola',
			dbSize : 102400,
			dbConnection : null,
			dbIdentity : 1,
			nombreImage : null,
			imagedataURI : null,
			init : function(){
				
				/*control de la app*/
				$('div#app').load('1.html');
				$('div#app').attr('param','1');
				$('#atras').hide();
				$('button#delante').click(function(e){ //cuando doy click adelante cargo el proximo
					e.preventDefault();
					var proximo=parseInt(indice=$('div#app').attr('param'))+1;
					var anterior=parseInt(indice=$('div#app').attr('param'))-1;
					$('div#app').empty();
					$('div#app').load(proximo+'.html');
					$('div#app').attr('param',proximo);
					$('#atras').show();
					if(proximo<20){
						 $('#adelante').show();
						 }else{
						 $('#adelante').hide();
							 
						}					
				});

				$('button#atras').click(function(e){
					e.preventDefault();
					var anterior=parseInt(indice=$('div#app').attr('param'))-1;
					var proximo=parseInt(indice=$('div#app').attr('param'))+1;
					$('div#app').empty();
					$('div#app').load(anterior+'.html');
					$('div#app').attr('param',anterior);
					$('#adelante').show();
					if(anterior>1){
							$('#atras').show();
						 }else{
							$('#atras').hide();
						}
						
				});

				
				if(window['openDatabase']!==null){
					this.transaction(function(tx){	
						tx.executeSql('CREATE TABLE IF NOT EXISTS Encuestas (id INTEGER PRIMARY KEY, edificio, piso, apartamento, resp1, resp2 TEXT)');												
					    tx.executeSql('SELECT * FROM Encuestas',[], function(tx,rs){					    		
							for(var i=0; i<rs.rows.length;i++){
								$.mobile.Censo.populateRegistro(rs.rows.item(i));
							}																									
						}, $.mobile.Censo.error);						
					}, $.mobile.Censo.error);					
					$.mobile.Censo.refreshRegistros(); 
				}else
					alert('Hemos detectado que no tienes soporte para Bases de datos, todas las imagenes que captures no se guardaran')
				
				/*$( '#nueva' ).live( 'pagebeforeshow',function(event, ui){
					$.mobile.Censo.resetRegistro();										
				});*/
				
			/*	$( '#sync' ).live( 'pagebeforeshow',function(event, ui){
					
					$.mobile.Censo.totales();										
				});*/
				
			/*	$( '#registro' ).live( 'pagebeforeshow',function(event, ui){
					$.mobile.Censo.resetRegistro();	
				});*/				
				$('#entrar').click(function(){
					$.mobile.Censo.iniciosesion();
				});		
					
									//$('#app').load('01.html');


			}, 
					
			iniciosesion: function(){
				$.mobile.changePage('#listado');
			},
			volver : function(){								
				$.mobile.changePage('#inicio',{ reverse: false, changeHash: false} );
			},						
					
			populateRegistro : function(registro){
				
				var registroId = registro.id;
				textid = '<li id="li'+ registroId + '" >';
				
				$('#items').append(
						$(textid).append(
								$('<a/>').append(
									$('<h3>').text( 'Edificio B0-'+registro.edificio)
								).append(								
										$('<p>').text('id: '+registroId+' Apartamento '+ registro.piso+'-'+registro.apartamento )										
								).click(function(){
									// $.mobile.Censo.abrirRegistro(registroId);
									$.mobile.Censo.abrirRegistro(registroId);
								})								
						).append(
								$('<a/>').click(function(){
									var _p = $(this).parent();																										
									_p.fadeOut('slow',function(){
										_p.remove();	
									});									
									$.mobile.Censo.borrarRegistro(registro.id);									
								})
						)
				);
				
			},
			refreshRegistros : function(){
				$('#items').listview('refresh');
			},
			clickGuardar: function(){
				
				var registro = {
						//id: $('#id1').val(),
						id: $('#id2').val(),
						edificio: $('#edificio option:selected').text(),
						piso: $('#piso option:selected').text(),
						apartamento: $('#apartamento option:selected').text(),
						resp1: $('#resp1 option:selected').text(),
						resp2: $('#resp2 option:selected').text()									
					};
							
				/*var f = new Date();	
				var nfecha = "";
				if(f.getDate() < 10){
				  nfecha= "0";
				}				
				nfecha += f.getDate() + "/";				
				if(f.getMonth() < 9){
				  nfecha+= "0";
				}
				nfecha+= (f.getMonth()+1) + "/" + f.getFullYear() + " ";						
				if(f.getHours()<10){
				  nfecha+= "0";
				}
				nfecha+= f.getHours() + ":";								
				if(f.getMinutes()<10){
				  nfecha+= "0";
				}
				nfecha+= f.getMinutes();					
				registro.fecha = nfecha;*/
				
				$.mobile.Censo.guardarEnDispositivo(registro,function() {
					$.mobile.Censo.populateRegistro(registro);
					$.mobile.Censo.refreshRegistros();
					$.mobile.changePage('#listado',{changeHash: false });
    			});				
			},
			guardarEnDispositivo : function(registro, cb){		
				var now = new Date();
		    	var month = (now.getMonth() + 1);               
			    var day = now.getDate();
			    var hora = now.getHours();               
			    var minuto = now.getMinutes();
			    if(month < 10){
			        month = "0" + month;
		        }
			    if(day < 10){ 
			        day = "0" + day;
		        }
			    var today = day + "/" + month + "/" + now.getFullYear();
			    			    
			    if(hora < 10){ 
			        hora = "0" + hora;
		        }			    
			    if(minuto < 10){ 
			        minuto = "0" + minuto;
			    }
			    var tiempo = " " + hora + ":" + minuto;
			    
			    registro.fecha = "".concat(today, tiempo);		
			    			
				var id = $('#id1').val();
				if(registro.apartamento== '' || registro.piso== ''){
					alert('Todos los campos son obligatorios');
					return false;
				}																													
				//Si no tiene id es registro nueva, se busca el último id y se imcrementa. Si tiene id se actualiza registro			
				if(registro.id == '' || registro.id =='undefined' || registro.id == null){
					this.transaction(function(tx){
						//tx.executeSql('SELECT COUNT(*) as count FROM Encuestas',[],function(tx,rs){											
						//	registro.id = rs.rows.item(0).count+1;
					
						tx.executeSql('SELECT max(id) as maxid  FROM Encuestas',[],function(tx,rs){											
							registro.id = rs.rows.item(0).maxid+1; 

						}, function(){
							registro.id = 1;							
						});
						$.mobile.Censo.insertarRegistro(registro,cb);
						
					}, $.mobile.Censo.error);												
				}else{					
					
					$.mobile.Censo.actualizarRegistro(registro);					
				}			         																		
			}, 
			nuevaRegistro : function(estatus){									
				usuario = $('#usuario').val();										
													
				var registro = {

						id: $('#id1').val(),
						edificio : $('#edificio option:selected').text(),
						piso: $('#piso option:selected').text(),
						apartamento: $('#apartamento option:selected').text(),
						resp1: $('#resp1 option:selected').text(),
						resp2 : $('#resp2 option:selected').text(),
						fecha :  new Date(),
															
				};   
												
				/*var data = '';
				
				titulo = $('#titulo1').val();				
				descripcion = $('#descripcion1').val();
				latitud= $('#latitud').text();
				longitud= $('#longitud').text();
				   				 	
			 	if(registro.titulo == '' || registro.descripcion == ''){
					alert('Todos los campos son obligatorios');
					return false;
				}																							
				data = titulo + "/" + descripcion + "/"+ usuario + "/" + latitud + "/" + longitud;
				if (registro.foto !='undefined' && registro.foto != null) {
					$.mobile.Censo.subirConFoto(registro.foto, data);//Guardar en el servidor
				}else{
					$.mobile.Censo.subirSinFoto(data);//Guardar en el servidor
				}											
				*/
				//Guardar en el telefono
				$.mobile.Censo.guardarEnDispositivo(registro,function() {
					$.mobile.Censo.populateRegistro(registro);
					$.mobile.Censo.refreshRegistros();
            		$.mobile.changePage('#listado',{ changeHash: false });
        		});				
			},
			
			subirSinFoto : function(data){																			
				$.ajax({
				    type : "POST",
				    url : 'http://foto.avn.info.ve/app.php/recibirsinfotomovil',
					data: data,
				    dataType : 'json',
				    success : function(msg){
                       	  	   //alert(msg.titulo);
                           	   // alert('La operación ha finalizado exitosamente');
   							  }
			    	});
			},
			
			insertarRegistro : function(registro,cb){
				this.transaction(function(tx){
				    //tx.executeSql('CREATE TABLE IF NOT EXISTS Encuestas (id INTEGER PRIMARY KEY, titulo, descripcion, fecha, foto)');
					tx.executeSql('INSERT INTO Encuestas (edificio, piso, apartamento, resp1, resp2) VALUES (?, ?,?,?,?)',[registro.edificio, registro.piso, registro.apartamento, registro.resp1, registro.resp2], cb, $.mobile.Censo.error);
				},$.mobile.Censo.error); 						
			},									
			actualizarRegistro : function(registro){
				this.transaction(function(tx){				    				    
					tx.executeSql("UPDATE Encuestas set edificio=?, piso=?, apartamento=?, resp1=?, resp2=?  where id=?",[registro.edificio, registro.piso, registro.apartamento, registro.resp1, registro.resp2, registro.id], function(tx,rs){				     															     											
						$.mobile.Censo.quitarRegistro(registro.id);					
						$.mobile.Censo.populateRegistro(registro);						
						$.mobile.changePage('#listado',{ changeHash: false });
						$.mobile.Censo.refreshRegistros();
						},$.mobile.Censo.error);
				},$.mobile.Censo.error);
			},
			connect : function(){
				this.dbConnection = window.openDatabase(this.dbName, this.dbVersion, this.dbDisplayName, this.dbSize);				
			},
			transaction : function(fn){
				this.connect();
				this.dbConnection.transaction(fn);
			},
			resetRegistro : function(){				
				$('#titulo1,#descripcion1,#id1').val('');
				$('#foto').hide();				
				$('#fecha1').val('');				
				var usuario = $('#usuario').val();											
				if(usuario.indexOf('@') != -1){		//consiguio arroba, es comunitario		
					$('#useravn').hide();
					$('#divsecc').hide();													
				}else{					
					$('#usercomunitario').hide();
				}		
				
				// Para arreglar el padding de los tres botones 
				$('div#useravn div.ui-block-a span:first').removeClass('ui-btn-inner ui-btn-corner-all').addClass('ui-btn-out-padding ui-btn-inner ui-btn-corner-all');												    
			    $('div#useravn div.ui-block-b span:first').removeClass('ui-btn-inner ui-btn-corner-all').addClass('ui-btn-out-padding ui-btn-inner ui-btn-corner-all');
			    $('div#useravn div.ui-block-c span:first').removeClass('ui-btn-inner ui-btn-corner-all').addClass('ui-btn-out-padding ui-btn-inner ui-btn-corner-all');
			    			    
			},
			resetRegistro : function(){									
				if( $('#registro').find('label.ui-radio-on') != 'undefined'){
					$('#registro').find('label.ui-radio-on').removeClass('ui-radio-on').addClass('ui-radio-off');
					$('#registro').find('span.ui-icon-radio-on').removeClass('ui-icon-radio-on').addClass('ui-icon-radio-off');
				}
				$('#nombre,#apellido,#cedula,#correo,#idusuario,#email,#clave1,#clave2').val('');								
			},
			abrirRegistro : function(id){		
				
				this.transaction(function(tx){
					tx.executeSql('SELECT * FROM Encuestas WHERE id = ?',[id], function(tx,rs){
						if(rs.rows.length>0){
							var visor = $('#registro');
							var registro = rs.rows.item(0);
							$('#edificio option:selected').text(registro.edificio);
							$('#piso option:selected').text(registro.piso);
							$('#apartamento option:selected').text(registro.apartamento);
							$('#resp1 option:selected').text(registro.resp1);
							$('#resp2 option:selected').text(registro.resp2);
							$('input#id1').val(registro.id);
							$('input#id2').val(registro.id);
						    $.mobile.changePage('#nueva',{'transition':'fade'});							
						}else  $.mobile.Censo.error({'code':'El registro no existe'});						
					}, $.mobile.Censo.error);
				}, $.mobile.Censo.error);					
			},	
			totales : function(){
				
				this.transaction(function(tx){
					tx.executeSql('SELECT count(id) as total_encuestas FROM Encuestas',[], function(tx,rs){
				    $('div#total_encuestas').text(rs.rows.item(0).total_encuestas);
					},$.mobile.Censo.error);
				
					tx.executeSql('SELECT count(resp1) as total_si FROM Encuestas WHERE resp1 like  "%S%"',[], function(tx,rs){
				    $('div#total_si').html(rs.rows.item(0).total_si);
				    },$.mobile.Censo.error);
					
					tx.executeSql('SELECT count(resp1) as total_si FROM Encuestas WHERE resp1 like  "%N%"',[], function(tx,rs){
					    $('div#total_no').html(rs.rows.item(0).total_no);
					},$.mobile.Censo.error);
					
					tx.executeSql('SELECT count(resp2) as total_6 FROM Encuestas WHERE resp2 like  "6"',[], function(tx,rs){
				    $('div#total_si').html(rs.rows.item(0).total_6);
					},$.mobile.Censo.error);
				
					tx.executeSql('SELECT count(resp2) as total_6 FROM Encuestas WHERE resp2 like  "6"',[], function(tx,rs){
				    $('div#total_6').html(rs.rows.item(0).total_6);
					},$.mobile.Censo.error);
				
					tx.executeSql('SELECT count(resp2) as total_3 FROM Encuestas WHERE resp2 like  "3"',[], function(tx,rs){
				    $('div#total_3').html(rs.rows.item(0).total_3);
					},$.mobile.Censo.error);
				
					tx.executeSql('SELECT count(resp2) as total_2 FROM Encuestas WHERE resp2 like  "2"',[], function(tx,rs){
				    $('div#total_2').html(rs.rows.item(0).total_2);
					},$.mobile.Censo.error);
				
					tx.executeSql('SELECT count(resp2) as total_1 FROM Encuestas WHERE resp2 like  "1"',[], function(tx,rs){
				    $('div#total_1').html(rs.rows.item(0).total_1);
					},$.mobile.Censo.error);
				
				//var total_si= rs.rows.item(0).total_si;
				},$.mobile.Censo.error);
				
			},	
		
			verRegistro : function(id){		
				this.transaction(function(tx){
					tx.executeSql('SELECT * FROM Encuestas WHERE id = ?',[id], function(tx,rs){
						if(rs.rows.length>0){							
							var visor = $('#registro');
							var registro = rs.rows.item(0);    																										
						    $.mobile.changePage('#nueva',{'transition':'fade'});						    
						    // $('input#titulo1').val(registro.titulo);
						    visor.find('#edificio').text(registro.edificio);
							visor.find('#piso').text(registro.piso);
							visor.find('#apartamento').text(registro.apartamento);
							visor.find('#resp1').text(registro.resp1);
							visor.find('#resp2').text(registro.resp2);																				
							visor.find('#id1').text(registro.id);				   
						}else  $.mobile.Censo.error({'code':'El registro no existe'});						
					}, $.mobile.Censo.error);
				}, $.mobile.Censo.error);					
			},
			quitarRegistro : function(registroId){
				textid = 'li'+registroId;				
				var _p = $('#'+textid);	
				_p.fadeOut('slow',function(){
					_p.remove();	
				});											
			},
			borrarRegistro : function(id){
				this.transaction(function(tx){
					tx.executeSql('DELETE FROM Encuestas WHERE id=?',[id]);
				}, $.mobile.Censo.error);									
			},
			error : function (err){
				alert('Error code : ' + err.code + ' msg:'+err.message);
			}
	};	
	$.mobile.Censo.init();	
})();
