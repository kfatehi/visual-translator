$(document).ready(function () {
    console.log("ahhh")
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
                    let resp = JSON.parse(myXhr.responseText);
                    handleResultFromOCR(resp);
                })
                return myXhr;
            }
        });
    });
})

function handleResultFromOCR(data) {
    window.raw = data;
    console.log(data);
    $('#stdout').text(data.stdout);
    $('#stderr').text(data.stderr);
}