(function (){
    window.addEventListener("filterSearchTab", function() {
        if(localStorage.getItem("searchTabActive") === "placeholder-unsaved-tab") {
            // debugger;
            const navList = document.querySelector('#search-nav-tabs').children
            const placeholderUnsavedTab = document.querySelector('#placeholder-unsaved-tab')
            //  const getActiveTab
            console.log('navListnavList', navList);

            const switchActiveTab = Array.from(navList).map((nav) => {
              
                if (nav.childNodes[1]["ariaSelected"] === "true") {
              
                    // nav.childNodes[1].classList.remove('active')
                    // nav.childNodes[1].setAttribute("aria-selected", "false"); 
                    placeholderUnsavedTab.classList.remove('placeholder-unsaved-tab-hidden')
                    placeholderUnsavedTab.childNodes[1].classList.add('active')
                    placeholderUnsavedTab.childNodes[1].setAttribute("aria-selected", "true"); 

                    const truck_modal = document.querySelector('#exampleModal');
                    const modal = bootstrap.Modal.getInstance(truck_modal);
                    modal.hide();
                  

                }
            })

            // console.log('>>switchActiveTab', switchActiveTab)

           
            // window.dispatchEvent(new Event("NewUnsavedTabEvent"));
        }
   

    });
 })()