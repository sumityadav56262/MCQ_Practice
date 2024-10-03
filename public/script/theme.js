// On page load, check if the user has a saved preference
let darkTheme = localStorage.getItem('darkTheme') === 'true';

// Apply the saved theme on page load
if (darkTheme) {
    document.getElementById('toggleSwitch').checked = true;
    document.documentElement.style.setProperty('--bg', 'rgb(37,37,37)');
    document.documentElement.style.setProperty('--text', 'rgb(240,240,240)');
    document.documentElement.style.setProperty('--shadow', 'rgb(0,0,0)');
    document.querySelector('.container').style.backgroundImage = "url('../images/moon.jpg')";
}

document.getElementById('toggleSwitch').addEventListener('change', function () {
    if (!darkTheme) {
        // Change the --bg, --text, and --shadow variables in :root
        document.documentElement.style.setProperty('--bg', 'rgb(37,37,37)');
        document.documentElement.style.setProperty('--text', 'rgb(240,240,240)');
        document.documentElement.style.setProperty('--shadow', 'rgb(0,0,0)');
        document.querySelector('.container').style.backgroundImage = "url('../images/moon.jpg')";
        darkTheme = true;
    } else {
        document.documentElement.style.setProperty('--bg', 'rgb(236, 221, 221)');
        document.documentElement.style.setProperty('--text', 'rgb(41,38,38)');
        document.documentElement.style.setProperty('--shadow', 'rgb(255,255,255)');
        document.querySelector('.container').style.backgroundImage = "url('../images/sun.jpg')";
        darkTheme = false;
    }
    // Store the theme preference in localStorage
    localStorage.setItem('darkTheme', darkTheme);
});