
const isOnSpecificDocument = document.location.pathname === "/Game/DinoDash/index.html";

if (isOnSpecificDocument) {
    /// code for dino index to find html
    console.log("Currently on Dino index");
    var myImage = document.getElementById('nav');
    myImage.style.display = 'none';
    
    fetch('../../menu.html')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

       // trying to effect the menu from the index.html
        const element = doc.getElementById('gamemenu');
        if (element && element.parentElement) {
            console.log("Element found:", element);
            element.parentElement.style.backgroundColor = 'red';
            // element.addEventListener('click', function() {
            //     console.log("Gamemenu was clicked!");
            // });
        } else {
            console.log("Element not found or has no parent.");
        }
        
    })
    .catch(error => console.error('Error fetching HTML:', error));

} else {
   
    console.log("Not on the specific document.");
}

// make sure I know what it puts me on
const isOnSpecificDocument2 = document.location.pathname === "mainIndex.html";
if (isOnSpecificDocument2) {
    
    console.log("Currently on main Index");
} else {
   
    console.log("Not on the specific document.");
}
