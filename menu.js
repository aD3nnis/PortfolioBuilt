(function() {
    const script = document.currentScript;
    const root = new URL(".", script.src);
    const link = (path) => new URL(path, root).href;

    const menu = document.createElement("div");
    menu.id = "site-menu";
    menu.setAttribute("role", "navigation");
    menu.innerHTML = `
        <div id="fixMenu">
            <a class="hyperlink" href="${link("index.html")}"><img class="logoMenu" src="${link("assets/images/logo1.png")}" alt="Home"></a>
            <ul id="menuItems">
                <li class="menu-list">
                    <a href="#">About</a>
                    <ul>
                        <li><a href="${link("About/resume.html")}">Resume</a></li>
                        <li><a href="https://www.linkedin.com/in/ava-dennis117/" rel="noopener noreferrer" target="_blank">Linkedin</a></li>
                    </ul>
                </li>
                <li class="menu-list">
                    <a href="#">Frontend</a>
                    <ul>
                        <li><a href="https://ava-dennis-fe-dev-resource-library.netlify.app" rel="noopener noreferrer" target="_blank">FE Site Library</a></li>
                        <li><a href="${link("Game/DinoDash/index.html")}">Javascript Game</a></li>
                    </ul>
                </li>
                <li class="menu-list">
                    <a href="#" class="nowrap">Software</a>
                    <ul>
                        <li><a href="${link("CppHouseGenerator/showcase.html")}">C++ House Generator</a></li>
                        <li><a href="https://stonkstracker.netlify.app/" rel="noopener noreferrer" target="_blank">Bitcoin Tracker</a></li>
                        <li><a href="${link("PythonSnake/showcase.html")}">Python Game</a></li>
                        <li><a href="${link("AwsUptimeMonitor/showcase.html")}">AWS Uptime Monitor</a></li>
                        <li><a href="${link("DigitalDeck/showcase.html")}">Digital Deck</a></li>
                    </ul>
                </li>
                <li class="menu-list">
                    <a href="#" class="design">2D Design</a>
                    <ul>
                        <li><a href="${link("Brands/brands.html")}">Brands</a></li>
                        <li><a href="${link("Typography/typography.html")}">Typography</a></li>
                        <li><a href="${link("Paintings/paintings.html")}">Paintings</a></li>
                        <li><a href="${link("Ventures/ventures.html")}">Ventures</a></li>
                    </ul>
                </li>
                <li class="menu-list">
                    <a href="#" class="nowrap">AI Chats</a>
                    <ul>
                        <li><a href="${link("AIChats/system-design.html")}">System Design</a></li>
                    </ul>
                </li>
            </ul>
        </div>`;

    script.replaceWith(menu);
})();
