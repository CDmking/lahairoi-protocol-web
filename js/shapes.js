    var SHAPES_DATA = {
        shapes: [{
            id: 'rect_1x1',
            matrix: [[1]]
        }, {
            id: 'rect_1x2_h',
            matrix: [[1, 1]]
        }, {
            id: 'rect_1x2_v',
            matrix: [
                [1],
                [1]
            ]
        }, {
            id: 'rect_1x3_h',
            matrix: [[1, 1, 1]]
        }, {
            id: 'rect_1x3_v',
            matrix: [
                [1],
                [1],
                [1]
            ]
        }, {
            id: 'rect_1x4_h',
            matrix: [[1, 1, 1, 1]]
        }, {
            id: 'rect_1x4_v',
            matrix: [
                [1],
                [1],
                [1],
                [1]
            ]
        }, {
            id: 'rect_1x5_h',
            matrix: [[1, 1, 1, 1, 1]]
        }, {
            id: 'rect_1x5_v',
            matrix: [
                [1],
                [1],
                [1],
                [1],
                [1]
            ]
        }, {
            id: 'square_2x2',
            matrix: [
                [1, 1],
                [1, 1]
            ]
        }, {
            id: 'rect_2x3',
            matrix: [
                [1, 1, 1],
                [1, 1, 1]
            ]
        }, {
            id: 'rect_3x2',
            matrix: [
                [1, 1],
                [1, 1],
                [1, 1]
            ]
        }, {
            id: 'l3_r0',
            matrix: [
                [1, 1],
                [1, 0]
            ]
        }, {
            id: 'l3_r90',
            matrix: [
                [1, 1],
                [0, 1]
            ]
        }, {
            id: 'l3_r180',
            matrix: [
                [0, 1],
                [1, 1]
            ]
        }, {
            id: 'l3_r270',
            matrix: [
                [1, 0],
                [1, 1]
            ]
        }, {
            id: 'l4_r0',
            matrix: [
                [1, 0],
                [1, 0],
                [1, 1]
            ]
        }, {
            id: 'l4_r90',
            matrix: [
                [1, 1, 1],
                [1, 0, 0]
            ]
        }, {
            id: 'l4_r180',
            matrix: [
                [1, 1],
                [0, 1],
                [0, 1]
            ]
        }, {
            id: 'l4_r270',
            matrix: [
                [0, 0, 1],
                [1, 1, 1]
            ]
        }, {
            id: 'l4_m0',
            matrix: [
                [0, 1],
                [0, 1],
                [1, 1]
            ]
        }, {
            id: 'l4_m90',
            matrix: [
                [1, 0, 0],
                [1, 1, 1]
            ]
        }, {
            id: 'l4_m180',
            matrix: [
                [1, 1],
                [1, 0],
                [1, 0]
            ]
        }, {
            id: 'l4_m270',
            matrix: [
                [1, 1, 1],
                [0, 0, 1]
            ]
        }, {
            id: 'z_h',
            matrix: [
                [1, 1, 0],
                [0, 1, 1]
            ]
        }, {
            id: 'z_v',
            matrix: [
                [0, 1],
                [1, 1],
                [1, 0]
            ]
        }, {
            id: 's_h',
            matrix: [
                [0, 1, 1],
                [1, 1, 0]
            ]
        }, {
            id: 's_v',
            matrix: [
                [1, 0],
                [1, 1],
                [0, 1]
            ]
        }, {
            id: 't_u',
            matrix: [
                [0, 1, 0],
                [1, 1, 1]
            ]
        }, {
            id: 't_r',
            matrix: [
                [1, 0],
                [1, 1],
                [1, 0]
            ]
        }, {
            id: 't_d',
            matrix: [
                [1, 1, 1],
                [0, 1, 0]
            ]
        }, {
            id: 't_l',
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
