var FACE = ( function() {
  // Private Section
  var K_VERSION                   = "1.0";
  var K_SERVICE_URL               = "http://api.sightcorp.com/api/detect/";
  var K_FORM_IMG_FIELD_NAME       = "img";
  var K_FORM_URL_FIELD_NAME       = "url";
  var K_FORM_CLIENT_ID_FIELD_NAME = "client_id";
  var K_FORM_APP_KEY_FIELD_NAME   = "app_key";
  var K_FORM_ATTRIBUTE_FIELD_NAME = "attribute";

  sendForm = function( formData, onSuccessCallback, onFailureCallback ) {
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open( "POST", K_SERVICE_URL, true );
    ajaxRequest.onreadystatechange = ( function( tmpEvent ) {
      console.log( "FACE request completed. Response text : " + ajaxRequest.responseText );
      if( ajaxRequest.status == 200 ) {
        jsonResponse = JSON.parse( ajaxRequest.responseText );
        if( jsonResponse.error_code && onFailureCallback ) {
          onFailureCallback( "F.A.C.E. request failed : " + jsonResponse.description );
        } else if( onSuccessCallback ) {
        // Successfull transaction
          console.log( "FACE successfull request" );
          onSuccessCallback( JSON.parse( ajaxRequest.responseText ) );
        }
      } else {
        console.log( "FACE request failed. HTTP Status = " + ajaxRequest.status );
        if( onFailureCallback ) {
          onFailureCallback( "FACE request failed. HTTP Status = " + ajaxRequest.status );
        }
      }
    } );
    ajaxRequest.send( formData );
    console.log( "FACE Sending request" );
  }

  return {
    getVersion : function() {
      return K_VERSION;
    },

    sendImage : function( imgFile, onSuccessCallback, onFailureCallback, api_key, client_id, attribute ) {

      if( !imgFile || !FACE.util.isImage( imgFile ) ) {
        if( onFailureCallback )
          onFailureCallback( "No file selected or file is not an image" );
        return;
      }

      var formData = new FormData();
      formData.append( K_FORM_IMG_FIELD_NAME,       imgFile );
      formData.append( K_FORM_CLIENT_ID_FIELD_NAME, client_id );
      formData.append( K_FORM_APP_KEY_FIELD_NAME,   app_key );
      if( attribute )
        formData.append( K_FORM_ATTRIBUTE_FIELD_NAME, attribute );

      sendForm( formData, onSuccessCallback, onFailureCallback );
    },

    sendUrl : function( url, onSuccessCallback, onFailureCallback, api_key, client_id, attribute ) {

      if( !url || ( ( typeof url ) != 'string' ) ) {
        if( onFailureCallback )
          onFailureCallback( "No file selected or file is not an image" );
        return;
      }

      var formData = new FormData();
      formData.append( K_FORM_URL_FIELD_NAME,       url );
      formData.append( K_FORM_CLIENT_ID_FIELD_NAME, client_id );
      formData.append( K_FORM_APP_KEY_FIELD_NAME,   app_key );
      if( attribute )
        formData.append( K_FORM_ATTRIBUTE_FIELD_NAME, attribute );

      sendForm( formData, onSuccessCallback, onFailureCallback );
    },

    // Webcam Module
    webcam : ( function() {
                 return {
                   startPlaying : function( videoTagID ) {
                     if( !videoTagID || ( ( typeof videoTagID ) != 'string' ) )
                       return;

                     var video = document.getElementById( videoTagID );

                     navigator.getMedia = ( navigator.getUserMedia ||
                                            navigator.webkitGetUserMedia ||
                                            navigator.mozGetUserMedia ||
                                            navigator.msGetUserMedia);
       
                     navigator.getMedia(
                       {
                         video: true,
                         audio: false
                       },
                       function( stream ) {
                         if( navigator.mozGetUserMedia ) {
                           video.mozSrcObject = stream;
                         } else {
                           var vendorURL = window.URL || window.webkitURL;
                           video.src = vendorURL.createObjectURL( stream );
                         }
                         video.play();
                       },
                       function( err ) {
                         console.log( "An error occured! " + err );
                       }
                     );
                   },

                   stopPlaying : function( videoTagID ) {
                     if( !videoTagID || ( ( typeof videoTagID ) != 'string' ) )
                       return;

                     var video = document.getElementById( videoTagID );
                     video.pause();
                     if( navigator.mozGetUserMedia )
                       video.mozSrcObject = null;
                     else
                       video.src = null;
                   },

                   takePicture : function( videoTagID, imageTagID ) {
                     if( !videoTagID || ( ( typeof videoTagID ) != 'string' ) )
                       return;

                     if( !imageTagID || ( ( typeof imageTagID ) != 'string' ) )
                       return;

                     var video = document.getElementById( videoTagID );
                     var image = document.getElementById( imageTagID );

                     // Prepare the canvas
                     var canvas = document.createElement( 'canvas' );
                     canvas.width  = video.videoWidth;
                     canvas.height = video.videoHeight;
                     canvas.style.visibility = "hidden";

                     var context = canvas.getContext( '2d' );
                     context.drawImage( video, 0, 0 );
                     image.src = canvas.toDataURL('image/jpeg');
                   },
                 }
               }() ),

    // Util Module
    util : ( function() {
               // Private data section
               var K_MAX_IMG_WIDTH  = 640;
               var K_MAX_IMG_HEIGHT = 480;

               return {

                 // isImage() // TODO : Diego : Document functions
                 isImage : function( file ) {
                   if( file && file.type )
                     return ( file.type.substring( 0, "image".length ) == "image" );
                   return false;
                 },

                 // computeSize()
                 computeSize : function( width, height ) {
                   // Keep the ratio
                   if( width > K_MAX_IMG_WIDTH ) {
                     height = Math.round( height *= K_MAX_IMG_WIDTH / width );
                     width = K_MAX_IMG_WIDTH;
                   }

                   if( height > K_MAX_IMG_HEIGHT ) {
                     width = Math.round( width *= K_MAX_IMG_HEIGHT / height );
                     height = K_MAX_IMG_HEIGHT;
                   }
                   return { width : width, height : height };
                 },

                 // http://stackoverflow.com/a/11954337
                 // dataURItoBlob()
                 dataURItoBlob : function( dataURI ) {
                   var binary = atob( dataURI.split( ',' )[ 1 ] );
                   var arr = [];
                   for( var i = 0; i < binary.length; i++ ) {
                     arr.push( binary.charCodeAt( i ) );
                   }
                   return new Blob( [new Uint8Array( arr )], { type : 'image/jpeg' } );
                 },

                 // resizeImage()
                 resizeImage : function( img, callback, width, height ) {

                   // TODO : Diego : Do proper input checking (all functions)
                   if( !FACE.util.isImage( img ) || !callback || ( width <= 0 ) || ( height <= 0 ) )
                     return false;

                   // Prepare the canvas
                   var canvas = document.createElement( 'canvas' );
                   canvas.width  = width;
                   canvas.height = height;
                   canvas.style.visibility = "hidden";

                   var context = canvas.getContext( '2d' );

                   // TODO : Diego : Consider using workers to remove callback chaining craziness
                   var readImgCallback = function( data ) {
                     var tmpImg = new Image();
                     tmpImg.onload = function() {
                       context.drawImage( tmpImg, 0, 0, width, height );
                       context.canvas.toBlob( function( blob ) { callback( blob ); }, 'image/jpeg' );
                     }
                     tmpImg.src = data;
                   }
                   FACE.util.readFileAsBase64( img, readImgCallback );
                   return true;
                 },

                 // getImageFromInput()
                 getImageFromInput : function( inputFileID ) {
                   return document.getElementById( inputFileID ).files[0];
                 },

                 // readFileAsBase64()
                 readFileAsBase64 : function( file, callback ) {
                   // Check for browser support
                   if( !( window.File &&
                          window.FileReader &&
                          window.FileList &&
                          window.Blob ) ) { 
                     alert( 'Your browser does not support File API.' );
                     return false;
                   }

                   if( !file || !( file instanceof Blob ) || !callback )
                     return false;

                   var reader = new FileReader();
                   if( callback ) {
                     reader.onloadend = function() { callback( this.result ); };
                   }
                   reader.readAsDataURL( file );
                   return true;
                 },

                 // displayImage()
                 displayImage : function( imgFile, imgTagID, callback ) {
                   if( !imgTagID || ( ( typeof imgTagID ) != 'string' ) )
                     return;

                   imgTag = document.getElementById( imgTagID );
                   if( callback )
                     imgTag.onload = callback();
                   FACE.util.readFileAsBase64( imgFile, function( imgData ){ imgTag.src = imgData } );
                 },

                 // resizeImageIfNeeded()
                 resizeImageIfNeeded : function( img, callback ) {
                   // TODO : Diego : Implement
                 },
               } 

             }() ), // End util

  } 

}() );

