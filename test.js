// Dynamically add HTML to the page
document.addEventListener("DOMContentLoaded", () => {
    const container = document.createElement('div');
    container.innerHTML = `
        <h2>Dynamically Added Content</h2>
        <p>This content was added by JavaScript!</p>
        <button id="alertButton">Click Me</button>
    `;
    document.body.appendChild(container);

    // Add event listener to the button
    document.getElementById("alertButton").addEventListener("click", () => {
        alert("Hello! You clicked the button.");
    });
});
