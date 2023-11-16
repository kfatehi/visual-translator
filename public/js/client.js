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
            url: "/upload",
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

    document.onpaste = (evt) => {
        const dT = evt.clipboardData || window.clipboardData;
        const file = dT.files[ 0 ];
        fileReader.readAsArrayBuffer(file);
    };

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
            top:  lensTargetOffset.top+y,
            'pointer-events': 'none'
        })
        
        ev.preventDefault();
    }
    function dragMove(ev) {
        if (!lensing) { return; }
    
        let x = ev.originalEvent.layerX - ev.toElement.offsetLeft;
        let y = ev.originalEvent.layerY - ev.toElement.offsetTop;
    
        let deltaX = x - lensPos.x;
        let deltaY = y - lensPos.y;
    
        // Calculate the position and dimensions of the lens box
        let boxLeft = deltaX < 0 ? lensTargetOffset.left + x : lensTargetOffset.left + lensPos.x;
        let boxTop = deltaY < 0 ? lensTargetOffset.top + y : lensTargetOffset.top + lensPos.y;
        let boxWidth = Math.abs(deltaX);
        let boxHeight = Math.abs(deltaY);
    
        lensDim = { height: boxHeight, width: boxWidth };
        lens.css({ left: boxLeft, top: boxTop, ...lensDim, display: 'block' });
    
        ev.preventDefault();
    }    
    function dragEnd(ev) {
        if (!lensing) { return; }

        lensing = false;
        lens.css({ display: 'none' });
        let { height, width } = lensDim;
        if (!(height > 5 && width > 5)) { return; }
    
        // Update lensPos coordinates based on the starting corner
        let x = lens.css('left').slice(0, -2) - lensTargetOffset.left;
        let y = lens.css('top').slice(0, -2) - lensTargetOffset.top;
        lensPos = { x, y };
    
        const div = document.createElement('div');
        const p = document.createElement('p');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        let img = $('img').get(0);
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        ctx.save();
        canvas.toBlob(function (blob) {
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
                        } else if (translateError || translation.length === 0) {
                            p.innerHTML = resp.ocrText + "<br>";
                            if (translateError)
                                p.innerHTML += "Translate Error: "+resp.ocrError;
                            else
                                p.innerHTML += "Translation failed.";
                        } else {
                            p.innerHTML = ocrText +"<br>"+translation.replace(/\n/g,'<br>');
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

    $('img').on('mouseleave', dragEnd);
    $('img').on('touchleave', dragEnd);
})