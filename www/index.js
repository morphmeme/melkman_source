import {Point, Polygon, init_panic_hook} from "triangulation";

init_panic_hook();

let d3 = require("d3");

let instructions = d3.select("#instructions")
    .append("span");

let svg = d3.select("body").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight); //TODO fit to window and scale on change

// points of the polygon
let points = [];

let draw_line = (x1, y1, x2, y2) => {
    svg.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .style("stroke", "rgb(255,0,0)") // move style later
        .style("stroke-width", 2);
};

let conv_bottom_left = (y) => {
    return -y - window.innerHeight;
};

let connect_polygon = (x, y) => {
    if (points.length > 0) {
        // try make origin bottom left better
        draw_line(points[points.length-2], -points[points.length-1] - window.innerHeight, x, y)
    }
};

let delete_polygon =  () => {
    d3.selectAll("circle")
        .remove();
    d3.selectAll("line")
        .remove();
    points = []
};

let undo_move = () => {
    d3.select("svg>circle:last-child").remove();
    d3.select("svg>line:last-child").remove();
    if (polygon_done) {
        polygon_done = false;
        return;
    }
    points.pop();
    points.pop();
};

d3.select("body")
    .on("keydown", function() {
        if (d3.event.keyCode == 8) {
            delete_polygon();
        }
        else if (d3.event.ctrlKey && d3.event.keyCode == 90) {
            undo_move();
        }
    });

let polygon_done = false;

let create_circle = (x, y) => {
    let c_scale = 1.5;
    let origin_x = x - c_scale * x;
    let origin_y = y - c_scale * y;

    return svg  // For new circle, go through the update process
        .append("circle")
        .on("mouseover", function()  {
            d3.select(this).attr("transform", `matrix(${c_scale}, 0, 0, ${c_scale}, ${origin_x}, ${origin_y})`);
        })
        .on("mouseout", function() {
            d3.select(this).attr("transform", "");
        })
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 10)
};

let create_text = (x, y, text) => {
    svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text);
};

let triangulation_count_init = () => {
    svg.on("click", () => {

        if (d3.event.defaultPrevented) {
            return
        }
        if (polygon_done) {
            delete_polygon();
            polygon_done = false;
            return
        }
        let [x, y] = [d3.event.pageX, d3.event.pageY];
        connect_polygon(x, y);

        points.push(x);
        points.push(-(y + window.innerHeight));

        create_circle(x, y).on("click", () => {
                d3.event.preventDefault();
                connect_polygon(x, y);
                let poly = Polygon.from_slice(new Float32Array(points));
                instructions.text("Number of triangulations: " + poly.nb_triangulations());
                polygon_done = true;
            })

    });
};

let melkman_init = () => {
    let div_table = d3.select("#instructions")
        .append("div")
        .style("height", "30em")
        .style("width", "30em")
        .style("overflow", "auto");
    let table = div_table
        .append("table")
        .attr("class", "table table-responsive");
    let thead = table.append('thead');
    let	tbody = table.append('tbody');

    thead.append('tr')
        .selectAll('th')
        .data(["Deque", "Left Tests"]).enter()
        .append('th')
        .text(function (column) { return column; });

    undo_move = () => {
        d3.select("svg>text:last-child").remove();
        d3.select("svg>circle:last-child").remove();
        d3.select("svg>line:last-child").remove();

        points.pop();
        points.pop();
        d3.select("tbody>tr:last-child").remove();
    };

    delete_polygon =  () => {
        d3.selectAll("circle")
            .remove();
        d3.selectAll("line")
            .remove();
        points = []
        d3.selectAll("tbody>tr").remove();
    };

    svg.on("click", () => {
        if (d3.event.defaultPrevented) {
            return
        }

        let [x, y] = [d3.event.pageX, d3.event.pageY];
        connect_polygon(x, y);

        points.push(x);
        points.push(-(y + window.innerHeight));

        // TODO move c_scale
        let c_scale = 1.5;

        create_circle(x, y);
        create_text(x,y-15,points.length / 2 - 1);


        let poly = Polygon.from_slice(new Float32Array(points));
        let deque_and_left_string = poly.melkmans_output();
        let [deque_string, left_string] = deque_and_left_string.split(";");
        if (points.length / 2 > 2) {
            let row = tbody.append("tr");
            row.append("td")
                .append("div")
                .attr("class", "deque")
                .text(deque_string);
            row.append("td")
                .append("div")
                .attr("class", "left-tests")
                .text(left_string);
        }

    });
};
melkman_init();