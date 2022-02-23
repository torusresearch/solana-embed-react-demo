export const writeToConsole = (mode: "info" | "success" | "warn" | "error" , text: string) => {
    const console_colors = {
        info: "#1c1c1c",
        success: "#28a745",
        warn: "#ffc107",
        error: "#dc3545"
    }
    const console = document.getElementById("console");
    if(console) {
        console.style.color = console_colors[mode];
        console.innerText = text;
    }
}