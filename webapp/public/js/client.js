$(document).ready(function () {
    const fileReader = new FileReader();
    let file = null;

    $('input').on('change', function () {
        file = this.files[0];
        fileReader.readAsArrayBuffer(file);
    });

    fileReader.addEventListener('load', async (event) => {
        let sourceBuffer = fileReader.result;
        let imageBlob = new Blob([sourceBuffer]);
        $('img').get(0).src = URL.createObjectURL(imageBlob);

        var formData = new FormData();

        formData.append("image", file);
        
        $.ajax({
            // Your server script to process the upload
            url: "/ocr",
            type: 'POST',

            // Form data
            data: formData,

            // Tell jQuery not to process data or worry about content-type
            // You *must* include these options!
            cache: false,
            contentType: false,
            processData: false,

            // Custom XMLHttpRequest
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                myXhr.addEventListener('load', ()=>{
                    // noop for initial upload
                })
                return myXhr;
            }
        });
    });


    /// LENSING 

    let lens = $('#lens');
    lens.css({
        position: 'absolute',
        opacity: 0.2,
        backgroundColor: 'blue',
        display: 'none'
    })

    let lensPos = {};
    let lensDim = {};
    let lensing = false;

    let lensTargetOffset = {};

    function dragStart(ev) {
        lensing = true;
        lensTargetOffset = {
            top: ev.target.offsetTop,
            left: ev.target.offsetLeft
        }

        let x = ev.originalEvent.layerX - ev.toElement.offsetLeft;
        let y = ev.originalEvent.layerY - ev.toElement.offsetTop;

        lensPos = { x, y};
        lens.css({
            left: lensTargetOffset.left+x,
            top:  lensTargetOffset.top+y
        })
        
        ev.preventDefault();
    }
    function dragMove(ev) {
        if (! lensing) { return; }

        let x = ev.originalEvent.layerX - ev.toElement.offsetLeft;
        let y = ev.originalEvent.layerY - ev.toElement.offsetTop;

        lensDim = { height: y-lensPos.y, width: x-lensPos.x}
        lens.css({...lensDim, display: 'block' })

        ev.preventDefault();
    }
    function dragEnd(ev){
        lensing = false;
        lens.css({ display: 'none' });
        let { height, width } = lensDim;
        if (!(height > 5 && width > 5)) { return; }
        const div = document.createElement('div');
        const p = document.createElement('p');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        let { x, y } = lensPos;
        let img = $('img').get(0);
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        ctx.save();
        canvas.toBlob(function(blob) {
            var newImg = document.createElement('img'),
                url = URL.createObjectURL(blob);
            
            newImg.onload = function() {
                // no longer need to read the blob so it's revoked
                URL.revokeObjectURL(url);
            };

            newImg.src = url;
            div.appendChild(newImg);
            p.innerHTML = "Waiting...";
            div.appendChild(p);

            document.body.appendChild(div);
            var formData = new FormData();
            formData.append("crop", blob);
            
            $.ajax({
                url: "/crop",
                type: 'POST',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                xhr: function () {
                    var myXhr = $.ajaxSettings.xhr();
                    myXhr.addEventListener('load', ()=>{
                        let resp = JSON.parse(myXhr.responseText);
                        console.log(resp);
                        let { ocrError, ocrText, translation, translateError, recordingURL } = resp;
                        if (ocrError) {
                            p.innerHTML = "OCR Error: "+resp.ocrError;
                        } else if (translateError) {
                            p.innerHTML = resp.ocrText + "<br>";
                            p.innerHTML += "Translate Error: "+resp.ocrError;
                        } else {
                            p.innerHTML = ocrText + "=" +translation.join('<br>');
                        }
                        if (recordingURL) {
                            console.log("Append");
                            var sound      = document.createElement('audio');
                            sound.controls = 'controls';
                            sound.src      = recordingURL;
                            sound.type     = 'audio/aac';
                            div.appendChild(sound);
                        }
                    })
                    return myXhr;
                }
            });
        });
        ev.preventDefault();
    }

    $('img').on('touchstart', dragStart);
    $('img').on('mousedown', dragStart);

    $('img').on('touchmove', dragMove);
    $('img').on('mousemove', dragMove);
    
    $('img').on('touchend', dragEnd);
    $('img').on('mouseup', dragEnd);
})