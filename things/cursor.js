const heart = [];
const heart_x = [];
const heart_y = [];
const heart_remaining_ticks = [];
const tiny = [];
const tiny_x = [];
const tiny_y = [];
const tiny_remaining_ticks = [];

const sparkles = 250;
const sparkle_lifetime = 30;
const sparkle_distance = 30;

let doc_height;
let doc_width;
let sparkles_enabled = null;

window.onload = function () {
    doc_height = document.documentElement.scrollHeight;
    doc_width = document.documentElement.scrollWidth;

    animate_sparkles();
    if (sparkles_enabled === null) {
        sparkle(true);
    }
};

function sparkle(enable = null) {
    if (enable === null) {
        sparkles_enabled = !sparkles_enabled;
    } else {
        sparkles_enabled = !!enable;
    }

    if (sparkles_enabled && heart.length < sparkles) {
        sparkle_init();
    }
}

function sparkle_destroy() {
    let elem;
    while (tiny.length) {
        elem = tiny.pop();
        if (elem) document.body.removeChild(elem);
    }

    while (heart.length) {
        elem = heart.pop();
        if (elem) document.body.removeChild(elem);
    }
}

function sparkle_init() {
    function create_div() {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.pointerEvents = "none";
        return div;
    }

    for (let i = 0; i < sparkles; i++) {

        const tiny_div = create_div();
        tiny_div.style.fontSize = "6px";
        tiny_div.style.color = "#d30dd3fa";
        tiny_div.style.visibility = "hidden";
        tiny_div.style.zIndex = "999";
        tiny_div.textContent = "♡";

        if (tiny[i]) document.body.removeChild(tiny[i]);

        document.body.appendChild(tiny_div);
        tiny[i] = tiny_div;
        tiny_remaining_ticks[i] = null;

        const heart_div = create_div();
        heart_div.style.fontSize = "10px";
        heart_div.style.color = "#d30dd3fa";
        heart_div.style.visibility = "hidden";
        heart_div.style.zIndex = "999";
        heart_div.textContent = "♡";

        if (heart[i]) document.body.removeChild(heart[i]);

        document.body.appendChild(heart_div);
        heart[i] = heart_div;
        heart_remaining_ticks[i] = null;
    }

    window.addEventListener('resize', function () {
        for (let i = 0; i < sparkles; i++) {
            heart_remaining_ticks[i] = null;
            heart[i].style.left = "0px";
            heart[i].style.top = "0px";
            heart[i].style.visibility = "hidden";

            tiny_remaining_ticks[i] = null;
            tiny[i].style.left = "0px";
            tiny[i].style.top = "0px";
            tiny[i].style.visibility = "hidden";
        }

        doc_height = document.documentElement.scrollHeight;
        doc_width = document.documentElement.scrollWidth;
    });

    document.onmousemove = function (e) {
        if (sparkles_enabled && !e.buttons) {

            const distance = Math.sqrt(e.movementX**2 + e.movementY**2);
            const delta_x = e.movementX * sparkle_distance * 2 / distance;
            const delta_y = e.movementY * sparkle_distance * 2 / distance;
            const probability = distance / sparkle_distance;

            let cumulative_x = 0;
            let mouse_y = e.pageY;
            let mouse_x = e.pageX;

            while (Math.abs(cumulative_x) < Math.abs(e.movementX)) {
                create_heart(mouse_x, mouse_y, probability);

                let delta = Math.random();
                mouse_x -= delta_x * delta;
                mouse_y -= delta_y * delta;
                cumulative_x += delta_x * delta;
            }
        }
    };
}

function animate_sparkles(fps = 60) {
    const interval = 1000 / fps;

    let alive = 0;

    for (let i = 0; i < heart.length; i++) {
        alive += update_heart(i);
    }

    for (let i = 0; i < tiny.length; i++) {
        alive += update_tiny(i);
    }

    if (alive === 0 && !sparkles_enabled) {
        sparkle_destroy();
    }

    setTimeout(() => animate_sparkles(fps), interval);
}

function create_heart(x, y, probability = 1.0) {
    if (x + 5 >= doc_width || y + 5 >= doc_height) return;
    if (Math.random() > probability) return;

    let min_lifetime = sparkle_lifetime * 2 + 1;
    let min_index = NaN;

    for (let i = 0; i < sparkles; i++) {
        if (!heart_remaining_ticks[i]) {
            min_lifetime = null;
            min_index = i;
            break;
        } else if (heart_remaining_ticks[i] < min_lifetime) {
            min_lifetime = heart_remaining_ticks[i];
            min_index = i;
        }
    }

    if (min_lifetime) {
        heart_to_tiny(min_index);
    }

    if (min_index >= 0) {
        heart_remaining_ticks[min_index] = sparkle_lifetime * 2;
        heart_x[min_index] = x;
        heart_y[min_index] = y;

        heart[min_index].style.left = x + "px";
        heart[min_index].style.top = y + "px";
        heart[min_index].style.visibility = "visible";
    }
}

function update_heart(i) {
    if (heart_remaining_ticks[i] === null) return false;

    heart_remaining_ticks[i]--;

    if (heart_remaining_ticks[i] === 0) {
        heart_to_tiny(i);
        return false;
    }

    if (heart_remaining_ticks[i] > 0) {
        heart_y[i] += 1 + 3 * Math.random();
        heart_x[i] += (i % 5 - 2) / 5;

        if (heart_y[i] + 5 < doc_height && heart_x[i] + 5 < doc_width) {
            heart[i].style.top = heart_y[i] + "px";
            heart[i].style.left = heart_x[i] + "px";
            return true;
        }
    }

    heart_remaining_ticks[i] = null;
    heart[i].style.visibility = "hidden";
    return false;
}

function heart_to_tiny(i) {
    if (heart_remaining_ticks[i] === null) return;

    if (heart_y[i] + 3 < doc_height && heart_x[i] + 3 < doc_width) {
        tiny_remaining_ticks[i] = sparkle_lifetime * 2;
        tiny_x[i] = heart_x[i];
        tiny_y[i] = heart_y[i];

        tiny[i].style.left = tiny_x[i] + "px";
        tiny[i].style.top = tiny_y[i] + "px";
        tiny[i].style.visibility = "visible";

        heart[i].style.visibility = "hidden";
    }

    heart_remaining_ticks[i] = null;
    heart[i].style.visibility = "hidden";
}

function update_tiny(i) {
    if (tiny_remaining_ticks[i] === null) return false;

    tiny_remaining_ticks[i]--;

    if (tiny_remaining_ticks[i] === sparkle_lifetime) {
        tiny[i].style.fontSize = "5px";
    }

    if (tiny_remaining_ticks[i] > 0) {
        tiny_y[i] += 1 + 2 * Math.random();
        tiny_x[i] += (i % 4 - 2) / 4;

        if (tiny_y[i] + 3 < doc_height && tiny_x[i] + 3 < doc_width) {
            tiny[i].style.top = tiny_y[i] + "px";
            tiny[i].style.left = tiny_x[i] + "px";
            return true;
        }
    }

    tiny_remaining_ticks[i] = null;
    tiny[i].style.visibility = "hidden";
    return false;
}