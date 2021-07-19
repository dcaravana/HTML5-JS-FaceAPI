var FaceAnalyse = (function() {
    var faces;
    lastrequestcompleted = true;

    function buildParameter()
    {
        return {
            // Request parameters
            "recognitionModel": "recognition_04",
            "returnFaceId": "true",
            "returnFaceLandmarks": "false",
            "returnFaceAttributes": "age,gender,emotion,smile,headPose",
        };
    }

    return{
        getFaces : function(){
            return faces;
        },
        analyzeSnapshot : function(canvas, apiurl, apikey){
            if(!lastrequestcompleted) return;
        
            lastrequestcompleted = false;
            
            canvas.toBlob(function(blob){
                $.ajax({
                    url: apiurl +'/face/v1.0/detect?'+ $.param(buildParameter()),
                    beforeSend: function(xhrObj){
                        // Request headers
                        xhrObj.setRequestHeader("Content-Type","application/octet-stream");
                        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",apikey);
                    },
                    type: "POST",
                    processData: false,
                    data: blob
                })
                .done(function(data) {
                    faces = data;
                    lastrequestcompleted = true;
                    console.log("success - faces retrieved: " + faces.length)
                })
                .fail(function() {
                    lastrequestcompleted = true;
                    console.log("error");
                });
            })
        }
    }
})();