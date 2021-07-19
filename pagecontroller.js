var PageController = (function() {
    var drawtimer;
    var analysetimer;
    var redrawTimeoutOnCanvas = 20;
    var video;
    var canvas;
    var context;
    var canvasRaw;


    function drawShadowedText(ctx, text, x, y, shadowBlur = 0)
    {
        ctx.save();
        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = "#000000";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
        
    function draw(){
        context.beginPath();
        context.clearRect(0, 0, 640, 480);
        context.drawImage(video,0,0,640,480);

        if((FaceAnalyse.getFaces() === undefined) || (FaceAnalyse.getFaces() == null)) return;

        for(i=0; i<FaceAnalyse.getFaces().length; i++){
            var face = FaceAnalyse.getFaces()[i];
            let fontSize = 12;
            let leftPos = face.faceRectangle.left, topPos = face.faceRectangle.top, horizonalOffset = face.faceRectangle.width + 10;

            context.beginPath();
            context.fillStyle = 'yellow';
            context.font = fontSize + 'pt Calibri';

            let labelsCount = 1;
            drawShadowedText(context, "Age: " + face.faceAttributes.age, leftPos + horizonalOffset, topPos + fontSize*labelsCount++);
            drawShadowedText(context, "Gender: " + face.faceAttributes.gender, leftPos + horizonalOffset, topPos + fontSize*labelsCount++);
            drawShadowedText(context, "Smile: " + face.faceAttributes.smile, leftPos + horizonalOffset, topPos + fontSize*labelsCount++);

            let emos = [
                'anger',
                'contempt',
                'disgust',
                'fear',
                'happiness',
                'neutral',
                'sadness',
                'surprise'
            ];

            drawShadowedText(context, "Emotions: ", leftPos + horizonalOffset, topPos + fontSize*labelsCount++);
            for(let emo of emos) {
                drawShadowedText(context, "  " + emo + " " + face.faceAttributes.emotion[emo], leftPos + horizonalOffset, topPos + fontSize*labelsCount++);
            }

            drawShadowedText(context, `Roll: ${face.faceAttributes.headPose.roll}` , leftPos + horizonalOffset, topPos + fontSize*labelsCount++);
            drawShadowedText(context, `Pitch: ${face.faceAttributes.headPose.pitch}` , leftPos + horizonalOffset, topPos + fontSize*labelsCount++);
            drawShadowedText(context, `Yaw: ${face.faceAttributes.headPose.yaw}` , leftPos + horizonalOffset, topPos + fontSize*labelsCount++);

            context.stroke();
            context.beginPath();
            context.lineWidth="3";
            context.strokeStyle="red";
            context.rect(face.faceRectangle.left, face.faceRectangle.top, face.faceRectangle.width, face.faceRectangle.height);
            context.stroke();
        }
    };

    return {
        startcam : function(){
            video = document.querySelector("#videoElement");
            canvas = document.querySelector('#canvas');
            context = canvas.getContext('2d');
            canvasRaw = document.querySelector('#canvas_raw');
            navigator.mediaDevices.getUserMedia({video:{width:640, height:480, facingMode: "user"}, audio: false})
                .then(handleVideo)
                .catch(videoError);
        
            function handleVideo(stream) {
                video.srcObject = stream;
                video.play();
                drawtimer = setInterval(draw, redrawTimeoutOnCanvas);
            }
        
            function videoError(e) {
                alert(e);
            }
        },
        
        stopcam : function(){
            clearInterval(drawtimer);
            video.pause();

            const stream = video.srcObject;
            const tracks = stream.getTracks();
          
            tracks.forEach(function(track) {
              track.stop();
            });
          
            video.srcObject = null;
        },

        startanalyse : function(){
            PageController.stopanalyse();
            var timerval = document.querySelector("#timeframe").value;
            var apiurl = document.querySelector("#apiurl").value;
            var apikey = document.querySelector("#apikey").value;
            var contextRaw=canvasRaw.getContext('2d');
            analysetimer = setInterval(function() {
                contextRaw.drawImage(video,0,0,640,480);
                FaceAnalyse.analyzeSnapshot(canvasRaw, apiurl, apikey);
            }, timerval);
        },
        
        stopanalyse : function(){
            clearInterval(analysetimer);
        }
    }
})();