import React from 'react';
import { TD_OPERATOR_TYPES } from '../../const';
import { TDNode } from '../../../../main/models/TDNode';
import { IconType } from 'react-icons';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const PROPERTY_NAME_MAP: Record<string, string> = {
    type: 'Type',
    rough: 'Roughness',
    tx: 'Translation X',
    ty: 'Translation Y',
    tz: 'Translation Z',
    constraint: 'Constraint',
    constrmean: 'Constraint Mean',
    end: 'End Value',
    chop: 'CHOP Reference',
    dataformat: 'Data Format',
    horzsource: 'Horizontal Source',
    vertsource: 'Vertical Source',
    displaceweightx: 'Displacement Weight X',
    displaceweighty: 'Displacement Weight Y',
    offsetweight: 'Offset Weight',
    extend: 'Extend Mode',
    material: 'Material',
    file: 'File Path',
    index: 'Index',
    timecodeop: 'Timecode Operator',
    label: 'Label',
    pageindex: 'Page Index',
    lookat: 'Look At',
    pxform: 'Pretransform',
    prx: 'Pretransform Rotation X',
    pry: 'Pretransform Rotation Y',
    prz: 'Pretransform Rotation Z',
    cr: 'Color Red',
    cg: 'Color Green',
    cb: 'Color Blue',
    dimmer: 'Dimmer',
    lighttype: 'Light Type',
    coneangle: 'Cone Angle',
    conedelta: 'Cone Delta',
    coneroll: 'Cone Roll',
    attenuated: 'Attenuated',
    attenuationstart: 'Attenuation Start',
    attenuationend: 'Attenuation End',
    attenuationexp: 'Attenuation Exponent',
    projmapmode: 'Projection Map Mode',
    projangle: 'Projection Angle',
    frontfacelit: 'Front Face Lit',
    shadowtype: 'Shadow Type',
    lightsize1: 'Light Size 1',
    lightsize2: 'Light Size 2',
    maxshadowsoftness: 'Max Shadow Softness',
    filtersamples: 'Filter Samples',
    searchsteps: 'Search Steps',
    polygonoffsetfactor: 'Polygon Offset Factor',
    polygonoffsetunits: 'Polygon Offset Units',
    drawpriority: 'Draw Priority',
    pickpriority: 'Pick Priority',
    invert: 'Invert',
    blacklevel: 'Black Level',
    brightness1: 'Brightness 1',
    gamma1: 'Gamma 1',
    contrast: 'Contrast',
    inlow: 'Input Low',
    inhigh: 'Input High',
    outlow: 'Output Low',
    outhigh: 'Output High',
    lowr: 'Low Red',
    highr: 'High Red',
    lowg: 'Low Green',
    highg: 'High Green',
    lowb: 'Low Blue',
    highb: 'High Blue',
    lowa: 'Low Alpha',
    higha: 'High Alpha',
    stepping: 'Stepping',
    stepsize: 'Step Size',
    threshold: 'Threshold',
    clamplow: 'Clamp Low',
    clamphigh: 'Clamp High',
    soften: 'Soften',
    gamma2: 'Gamma 2',
    opacity: 'Opacity',
    brightness2: 'Brightness 2',
    clamp: 'Clamp',
    clamplow2: 'Clamp Low 2',
    clamphigh2: 'Clamp High 2',
    fillmode: 'Fill Mode',
    npasses: 'Number of Passes',
    chanmask: 'Channel Mask',
    top: 'TOP Reference',
    crop: 'Crop Mode',
    exportmethod: 'Export Method',
    scale: 'Scale',
    postxord: 'Post Transform Order',
    envlightmap: 'Environment Light Map',
    seed: 'Seed',
    period: 'Period',
    harmon: 'Harmonics',
    spread: 'Spread',
    gain: 'Gain',
    offset: 'Offset',
    mono: 'Monochrome',
    format: 'Format',
    rx: 'Rotation X',
    ry: 'Rotation Y',
    rz: 'Rotation Z',
    sx: 'Scale X',
    sy: 'Scale Y',
    sz: 'Scale Z',
    px: 'Pivot X',
    py: 'Pivot Y',
    pz: 'Pivot Z',
    lookup: 'Lookup Mode',
    method: 'Shuffle Method',
    orthowidth: 'Ortho Width',
    fov: 'Field of View',
    near: 'Near Clipping Plane',
    far: 'Far Clipping Plane',
    winrollpivot: 'Window Roll Pivot',
    winroll: 'Window Roll',
    ipdshift: 'IPD Shift',
    fognear: 'Fog Near',
    fogfar: 'Fog Far',
    fogcolorr: 'Fog Color Red',
    fogcolorg: 'Fog Color Green',
    fogcolorb: 'Fog Color Blue',
    fogalpha: 'Fog Alpha',
    startcolorr: 'Start Color Red',
    startcolorg: 'Start Color Green',
    startcolorb: 'Start Color Blue',
    huerange: 'Hue Range',
    huefalloff: 'Hue Falloff',
    saturationrange: 'Saturation Range',
    saturationfalloff: 'Saturation Falloff',
    valuerange: 'Value Range',
    valuefalloff: 'Value Falloff',
    hueoffset: 'Hue Offset',
    saturationmult: 'Saturation Multiplier',
    valuemult: 'Value Multiplier',
    resmult: 'Resolution Multiplier',
    outputaspect: 'Output Aspect Ratio',
    vstart: 'Vertical Start',
    darkuv1: 'Dark UV Coordinate 1',
    darkuv2: 'Dark UV Coordinate 2',
    lightuv1: 'Light UV Coordinate 1',
    lightuv2: 'Light UV Coordinate 2',
    specularlevel: 'Specular Level',
    metallic: 'Metallic',
    roughness: 'Roughness',
    ambientocclusion: 'Ambient Occlusion',
    envlightquality: 'Environment Light Quality',
    basecolormapextendu: 'Base Color Map Extend U',
    basecolormapextendw: 'Base Color Map Extend W',
    basecolormapfilter: 'Base Color Map Filter',
    basecolormapanisotropy: 'Base Color Map Anisotropy',
    metalnessmapextendu: 'Metalness Map Extend U',
    metalnessmapextendw: 'Metalness Map Extend W',
    metalnessmapfilter: 'Metalness Map Filter',
    metallicmapcoord: 'Metallic Map Coordinate',
    roughnessmapcoord: 'Roughness Map Coordinate',
    bumpscale: 'Bump Scale',
    skelrootpath: 'Skeleton Root Path',
    legacyalphabehavior: 'Legacy Alpha Behavior',
    const0name: 'Constant 0 Name',
    const0value: 'Constant 0 Value',
    const1name: 'Constant 1 Name',
    const1value: 'Constant 1 Value',
    renameto: 'Rename To',
    exp: 'Exponent',
    amp: 'Amplitude',
    preop: 'Pre-operation',
    chanop: 'Channel Operation',
    postop: 'Post-operation',
    lineartosrgb: 'Linear to sRGB',
    integer: 'Integer Operation',
    inputmask: 'Input Mask',
    preoff: 'Pre-offset',
    postoff: 'Post-offset',
    dat: 'Data Table',
    color1: 'Color 1',
    color2: 'Color 2',
    color3: 'Color 3',
    color4: 'Color 4',
    interp: 'Interpolation',
    combineinput: 'Combine Input',
    select: 'Select',
    strength: 'Strength',
    edgecolorr: 'Edge Color Red',
    edgecolorg: 'Edge Color Green',
    edgecolorb: 'Edge Color Blue',
    edgecolora: 'Edge Color Alpha',
    premultrgbbyalpha: 'Premultiply RGB by Alpha',
    alphaoutputmenu: 'Alpha Output Menu',
    torange1: 'To Range Start',
    torange2: 'To Range End',
    instancing: 'Enable Instancing',
    instanceop: 'Instance Operator',
    instancetx: 'Instance Translate X',
    instancety: 'Instance Translate Y',
    instancetz: 'Instance Translate Z',
    instancerx: 'Instance Rotate X',
    instancery: 'Instance Rotate Y',
    instancerz: 'Instance Rotate Z',
    instancesx: 'Instance Scale X',
    instancesy: 'Instance Scale Y',
    instancesz: 'Instance Scale Z',
    instancerottoorder: 'Instance Rotation Order',
    instancerottoforward: 'Instance Forward Direction',
    instancerottox: 'Instance Rotate-to X',
    instancerottoy: 'Instance Rotate-to Y',
    instancerottoz: 'Instance Rotate-to Z',
    instancetexmode: 'Instance Texture Mode',
    instancecolorpremult: 'Instance Color Premultiplied',
    instancer: 'Instance Red',
    instanceg: 'Instance Green',
    instanceb: 'Instance Blue',
    redmin: 'Red Min',
    redmax: 'Red Max',
    rsoftlow: 'Red Soft Low',
    rsofthigh: 'Red Soft High',
    greenmin: 'Green Min',
    greenmax: 'Green Max',
    gsoftlow: 'Green Soft Low',
    gsofthigh: 'Green Soft High',
    bluemin: 'Blue Min',
    bluemax: 'Blue Max',
    bsoftlow: 'Blue Soft Low',
    bsofthigh: 'Blue Soft High',
    rgbout: 'RGB Output',
    alphaout: 'Alpha Output',
    resolutionw: 'Resolution Width',
    resolutionh: 'Resolution Height',
    g: 'Green Channel',
    b: 'Blue Channel',
    a: 'Alpha Channel',
    rate: 'Rate',
    legacyxform: 'Legacy Transform',
    fit: 'Fit Mode',
    outputresolution: 'Output Resolution',
    inputfiltertype: 'Input Filter Type',
    reverseanchors: 'Reverse Anchors',
    anchoru: 'Anchor U',
    anchorv: 'Anchor V',
    anchorw: 'Anchor W',
    autoexportroot: 'Auto Export Root',
    radx: 'Radius X',
    rady: 'Radius Y',
    arc: 'Arc',
    pbx: 'Position B X',
    pby: 'Position B Y',
    pbz: 'Position B Z',
    sizex: 'Size X',
    sizey: 'Size Y',
    orient: 'Orientation',
    rad2: 'Radius 2',
    height: 'Height',
    input: 'Input',
    radz: 'Radius Z',
    ncy: 'Number of Copies Y',
    copyg: 'Copy Group',
    diffr: 'Diffuse Red',
    diffg: 'Diffuse Green',
    diffb: 'Diffuse Blue',
    specr: 'Specular Red',
    specg: 'Specular Green',
    specb: 'Specular Blue',
    emitr: 'Emit Red',
    emitg: 'Emit Green',
    emitb: 'Emit Blue',
    shininess: 'Shininess',
    surftype: 'Surface Type',
    addpts: 'Add Points',
    filtertype: 'Filter Type',
    tileX: 'Tile X',
    tileY: 'Tile Y',
    sizeX: 'Size X',
    sizeY: 'Size Y',
    timeslice: 'Time Slice',
    lag1: 'Lag 1',
    lag2: 'Lag 2',
    preshrink: 'Preshrink',
    size: 'Size',
    operand: 'Operand',
    clampinput: 'Clamp Input',
    output: 'Output',
    limitmax: 'Limit Max',
    min: 'Minimum',
    rgb: 'RGB',
    radiusx: 'Radius X',
    radiusy: 'Radius Y',
    softness: 'Softness',
    colorr: 'Color Red',
    colorg: 'Color Green',
    colorb: 'Color Blue',
    swaporder: 'Swap Order',
    exporrtable: 'Export Table',
    keys: 'Keys',
    projection: 'Projection',
    orthoorigin: 'Ortho Origin',
    bgcolorr: 'Background Color Red',
    bgcolorg: 'Background Color Green',
    bgcolorb: 'Background Color Blue',
    bgcolora: 'Background Color Alpha',
    noisescale: 'Noise Scale',
    geometry: 'Geometry',
    fillalpha: 'Fill Alpha',
    utility: 'Utility',
    includeinorder: 'Include In Order',
    ext0promote: 'Ext 0 Promote',
    parentshortcut: 'Parent Shortcut',
    Opviewerinteractive: 'Op Viewer Interactive',
    Opvieweroversize: 'Op Viewer Oversize',
    Opviewersizew: 'Op Viewer Size Width',
    Opviewersizeh: 'Op Viewer Size Height',
    Opviewerscale: 'Op Viewer Scale',
    Opviewerjustifyx: 'Op Viewer Justify X',
    Opviewerjustifyy: 'Op Viewer Justify Y',
    Opviewerfillbodytitle: 'Op Viewer Fill Body Title',
    Opviewerzoom: 'Op Viewer Zoom',
    Opvieweroffsetx: 'Op Viewer Offset X',
    Opvieweroffsety: 'Op Viewer Offset Y',
    Opviewerfillalpha: 'Op Viewer Fill Alpha',
    Tilealign: 'Tile Align',
    Tileheight: 'Tile Height',
    Bodymaxwidth: 'Body Max Width',
    cachesize: 'Cache Size',
    outputindex: 'Output Index',
    Bodyfontsize: 'Body Font Size',
    Bodylimitwidth: 'Body Limit Width',
    Bodylimitheight: 'Body Limit Height',
    Bodywordwrap: 'Body Word Wrap',
    instancecolorop: 'Instance Color Operator',
    blending: 'Blending',
    alpha: 'Alpha',
    resource: 'Resource',
    offtoon: 'Off Toon',
    zeropoint: 'Zero Point',
    green: 'Green',
    blue: 'Blue',
    red: 'Red',
    outputredchan: 'Output Red Channel',
    outputgreenchan: 'Output Green Channel',
    outputbluechan: 'Output Blue Channel',
    outputalphachan: 'Output Alpha Channel',
    modifiers: 'Modifiers',
    midpointx: 'Midpoint X',
    midpointy: 'Midpoint Y',
    ressource: 'Resolution Source',
    aspect1: 'Aspect 1',
    aspect2: 'Aspect 2',
    offsetx: 'Offset X',
    offsety: 'Offset Y',
    speed: 'Speed'
};

interface OperatorCardProps {
    node: TDNode;
    Icon?: IconType;
    iconColor?: string;
    compare?: TDNode;
}

const OperatorCard: React.FC<OperatorCardProps> = ({ node, Icon, iconColor, compare }) => {
    const getFileImage = (type?: string) => {
        switch (type) {
            case TD_OPERATOR_TYPES.COMPONENT_OPERATOR:
                return 'COMP.png';
            case TD_OPERATOR_TYPES.CHANNEL_OPERATOR:
                return 'CHOP.png';
            case TD_OPERATOR_TYPES.TEXTURE_OPERATOR:
                return 'TOP.png';
            case TD_OPERATOR_TYPES.SURFACE_OPERATOR:
                return 'SOP.png';
            case TD_OPERATOR_TYPES.MATERIAL_OPERATOR:
                return 'MAT.png';
            case TD_OPERATOR_TYPES.DATA_OPERATOR:
                return 'DAT.png';
            default:
                return '/geo.png'; // TODO: Add all remaining supported operators.
        }
    };

    const getPropertyName = (key: string) => {
        return PROPERTY_NAME_MAP[key] || key;
    };

    return (
        <Popover modal>
            <PopoverTrigger
                className={`${
                    iconColor === 'text-blue-700'
                        ? 'border-2 border-blue-700'
                        : iconColor === 'text-red-600'
                          ? 'border-2 border-red-600'
                          : iconColor === 'text-green-500'
                            ? 'border-2 border-green-500'
                            : iconColor === 'text-yellow-400'
                              ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-500/50'
                              : ''
                } m-1 flex bg-gray-700 rounded-md w-full h-full flex-col items-center`}
            >
                {' '}
                <div className="w-full h-full text-white rounded-md p-2 relative flex justify-center items-center">
                    <img
                        src={getFileImage(node.type)}
                        alt={node.type}
                        className="w-full h-full object-contain"
                    />

                    {Icon && iconColor && (
                        <Icon className={`absolute bottom-2 left-2 ${iconColor}`} />
                    )}

                    <div className="absolute bottom-2 right-2 bg-gray-700 text-xs px-1 py-0.5 rounded text-yellow-500">
                        {node.type || 'geo'}
                    </div>
                </div>
                <p className="text-white mt-2 text-center">{node.name}</p>
            </PopoverTrigger>
            <PopoverContent className="bg-gray-600 border-gray-800 py-2 px-3 flex flex-col text-white w-fit max-h-96">
                <div className="text-h3 mb-1">Properties: </div>
                {node.properties && (
                    <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
                        {Array.from(node.properties).map(([key, value]) => (
                            <div
                                key={key}
                                className="py-1 px-2 bg-gray-200 text-black rounded-lg flex flex-row"
                            >
                                {compare && compare.properties?.get(key) !== value ? (
                                    <>
                                        {compare?.properties?.get(key) ? (
                                            <>
                                                <div className="font-bold">
                                                    {getPropertyName(key)}
                                                </div>
                                                <div className="text-blue-600">
                                                    : {compare?.properties?.get(key)} -{'>'} {value}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="font-bold">
                                                    {getPropertyName(key)}
                                                </div>
                                                <div className="text-green-500">: {value}</div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="font-bold">{getPropertyName(key)}</div>:{' '}
                                        {value}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

export default OperatorCard;
