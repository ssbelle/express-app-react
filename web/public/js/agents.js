var element = document.querySelector("#kt_modal_create_app_stepper");
var form = document.getElementById("kt_modal_create_app_form");

// Initialize Stepper
var stepper = new KTStepper(element);

// Handle next step
stepper.on("kt.stepper.next", function (stepper) {
        //form.reportValidity();
        stepper.goNext(); // go next step
});

// Handle previous step
stepper.on("kt.stepper.previous", function (stepper) {
    stepper.goPrevious(); // go previous step
});


var button = document.querySelector("#diabledagentBtn");
button.addEventListener("click", function () {
    button.setAttribute("data-kt-indicator", "on");
    document.getElementById("enableagent").value = "false";
    document.getElementById("kt_modal_create_app_form").submit();    
});

var savebutton = document.querySelector("#saveagentinfo");
savebutton.addEventListener("click", function () {
    // Activate indicator
    savebutton.setAttribute("data-kt-indicator", "on");
    return true;
});

function saveAgent() {
    var savebutton = document.querySelector("#saveagentinfo");
    savebutton.setAttribute("data-kt-indicator", "on");
    return true;
}