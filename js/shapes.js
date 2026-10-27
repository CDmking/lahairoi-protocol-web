    var SHAPES_DATA = {
        shapeCount: 32,
        shapes: [{
            id: 'rect_1x1',
            rows: 1,
            cols: 1,
            matrix: [
                [1]
            ]
        }, {
            id: 'rect_1x2_h',
            rows: 1,
            cols: 2,
            matrix: [
                [1, 1]
            ]
        }, {
            id: 'rect_1x2_v',
            rows: 2,
            cols: 1,
            matrix: [
                [1],
                [1]
            ]
        }, {
            id: 'rect_1x3_h',
            rows: 1,
            cols: 3,
            matrix: [
                [1, 1, 1]
            ]
        }, {
            id: 'rect_1x3_v',
            rows: 3,
            cols: 1,
            matrix: [
                [1],
                [1],
                [1]
            ]
        }, {
            id: 'rect_1x4_h',
            rows: 1,
            cols: 4,
            matrix: [
                [1, 1, 1, 1]
            ]
        }, {
            id: 'rect_1x4_v',
            rows: 4,
            cols: 1,
            matrix: [
                [1],
                [1],
                [1],
                [1]
            ]
        }, {
            id: 'rect_1x5_h',
            rows: 1,
            cols: 5,
            matrix: [
                [1, 1, 1, 1, 1]
            ]
        }, {
            id: 'rect_1x5_v',
            rows: 5,
            cols: 1,
            matrix: [
                [1],
                [1],
                [1],
                [1],
                [1]
            ]
        }, {
            id: 'square_2x2',
            rows: 2,
            cols: 2,
            matrix: [
                [1, 1],
                [1, 1]
            ]
        }, {
            id: 'rect_2x3',
            rows: 2,
            cols: 3,
            matrix: [
                [1, 1, 1],
                [1, 1, 1]
            ]
        }, {
            id: 'rect_3x2',
            rows: 3,
            cols: 2,
            matrix: [
                [1, 1],
                [1, 1],
                [1, 1]
            ]
        }, {
            id: 'l3_r0',
            rows: 2,
            cols: 2,
            matrix: [
                [1, 1],
                [1, 0]
            ]
        }, {
            id: 'l3_r90',
            rows: 2,
            cols: 2,
            matrix: [
                [1, 1],
                [0, 1]
            ]
        }, {
            id: 'l3_r180',
            rows: 2,
            cols: 2,
            matrix: [
                [0, 1],
                [1, 1]
            ]
        }, {
            id: 'l3_r270',
            rows: 2,
            cols: 2,
            matrix: [
                [1, 0],
                [1, 1]
            ]
        }, {
            id: 'l4_r0',
            rows: 3,
            cols: 2,
            matrix: [
                [1, 0],
                [1, 0],
                [1, 1]
            ]
        }, {
            id: 'l4_r90',
            rows: 2,
            cols: 3,
            matrix: [
                [1, 1, 1],
                [1, 0, 0]
            ]
        }, {
            id: 'l4_r180',
            rows: 3,
            cols: 2,
            matrix: [
                [1, 1],
                [0, 1],
                [0, 1]
            ]
        }, {
            id: 'l4_r270',
            rows: 2,
            cols: 3,
            matrix: [
                [0, 0, 1],
                [1, 1, 1]
            ]
        }, {
            id: 'l4_m0',
            rows: 3,
            cols: 2,
            matrix: [
                [0, 1],
                [0, 1],
                [1, 1]
            ]
        }, {
            id: 'l4_m90',
            rows: 2,
            cols: 3,
            matrix: [
                [1, 0, 0],
                [1, 1, 1]
            ]
        }, {
            id: 'l4_m180',
            rows: 3,
            cols: 2,
            matrix: [
                [1, 1],
                [1, 0],
                [1, 0]
            ]
        }, {
            id: 'l4_m270',
            rows: 2,
            cols: 3,
            matrix: [
                [1, 1, 1],
                [0, 0, 1]
            ]
        }, {
            id: 'z_h',
            rows: 2,
            cols: 3,
            matrix: [
                [1, 1, 0],
                [0, 1, 1]
            ]
        }, {
            id: 'z_v',
            rows: 3,
            cols: 2,
            matrix: [
                [0, 1],
                [1, 1],
                [1, 0]
            ]
        }, {
            id: 's_h',
            rows: 2,
            cols: 3,
            matrix: [
                [0, 1, 1],
                [1, 1, 0]
            ]
        }, {
            id: 's_v',
            rows: 3,
            cols: 2,
            matrix: [
                [1, 0],
                [1, 1],
                [0, 1]
            ]
        }, {
            id: 't_u',
            rows: 2,
            cols: 3,
            matrix: [
                [0, 1, 0],
                [1, 1, 1]
            ]
        }, {
            id: 't_r',
            rows: 3,
            cols: 2,
            matrix: [
                [1, 0],
                [1, 1],
                [1, 0]
            ]
        }, {
            id: 't_d',
            rows: 2,
            cols: 3,
            matrix: [
                [1, 1, 1],
                [0, 1, 0]
            ]
        }, {
            id: 't_l',
            rows: 3,
            cols: 2,
            matrix: [
                [0, 1],
                [1, 1],
                [0, 1]
            ]
        }]
    };

    var SHAPES_ALL = SHAPES_DATA.shapes.map(function (shape) {
        return shape.matrix;
    });
