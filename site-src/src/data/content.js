// Site copy. Experience, summary, publication and education follow CV.pdf (Sep 2026);
// capability lists are generated from C:\LocalLLM\jobs\profile.json (core + extras)
// by jobs/_gen_caps.py - the CV prints the core subset, the site shows the full set.

export const person = {
  location: 'Guntur, Andhra Pradesh, India',
  email: 'k.v.shivateja06@outlook.com',
  phone: '+91 89771 22533',
  linkedin: { label: 'in/kvsivateja2706', href: 'https://linkedin.com/in/kvsivateja2706' },
  github: { label: 'Alita-Tempest', href: 'https://github.com/Alita-Tempest' },
};

export const disciplines = [
  {
    n: '01', h: 'PCB design',
    p: 'I draw the schematic and lay out 2- and 4-layer boards. That covers impedance control, keeping RF and mixed-signal sections apart, the power path, and getting the files ready for manufacturing.',
  },
  {
    n: '02', h: 'Hardware design',
    p: 'I choose the regulators and parts, add protection and filtering, and think about heat. Then I bring the board up on the bench, test it, and track down whatever doesn’t work.',
  },
  {
    n: '03', h: 'Embedded firmware',
    p: 'I write embedded C for the ESP32-S3 with ESP-IDF and FreeRTOS: USB host, getting peripherals running, low-power scheduling, and drivers for sensors and displays.',
  },
  {
    n: '04', h: 'Field protocols',
    p: 'I’ve built LoRa links with matched front ends and Modbus-RTU over RS-485, and I use UART, SPI, I²C, I²S and CAN on the board.',
  },
  {
    n: '05', h: 'Digital / VLSI',
    p: 'I’ve written Verilog RTL and taken it through synthesis, timing and place-and-route to GDSII, and done FPGA work in Vivado. It’s real training, but boards are my everyday work.',
  },
];

export const experience = [
  {
    from: 'Oct 2026', to: 'Present', current: true,
    role: 'Hardware & PCB Design Engineer',
    org: 'Freelance — client projects',
    where: 'Remote',
    points: [
      'I designed an <b>audible altimeter board around a Seeed XIAO nRF54LM20A</b> from start to finish in EasyEDA: schematic, BOM and layout. It had to fit in a 56 × 52 × 11 mm case along with its speaker and battery. It reads altitude from a Bosch BMP581 sensor and plays sound through a MAX98357A amplifier that the firmware can switch off.',
      'I added <b>single-cell Li-Po protection</b> (an FS312F-G with an FS8205A dual MOSFET), resistor-set amplifier gain, and spare footprints for an output filter in case EMC testing calls for one. A single SWD header lets me debug both the nRF54 and the module’s SAMD11.',
      'For a client on Freelancer.com I designed <b>Rev D of a battery-powered ESP32-WROOM-32E controller</b> in KiCad. They gave me the spec and an initial BOM; I drew the schematic, laid out a 53 × 34 mm two-layer board with parts on both sides to fit their enclosure, and drafted the final BOM. It drives a servo, RGB LEDs and a buzzer, with a tilt-switch input and a 32.768 kHz crystal for keeping time in deep sleep.',
      'I built its <b>power circuit around a low sleep current</b>: the battery is switched through two P-MOSFETs, the ESP32 runs from an always-on 3.3 V regulator, and the 5 V boost is cut off from the battery completely when it isn’t needed. I delivered a DRC-clean package (Gerbers, drill files, final BOM, pick-and-place and a STEP model), and the client rated the job <b>5.0</b>.',
    ],
    tags: ['EasyEDA Pro', 'KiCad', 'nRF54', 'ESP32', 'I²S audio', 'Li-Po protection', 'Load switching', 'JLCPCB assembly'],
  },
  {
    from: 'Mar 2026', to: 'Present', current: true,
    role: 'Embedded Electronics Engineer & PCB Designer',
    org: 'Dletabotix Private Limited',
    where: 'Guntur, India',
    points: [
      'I design the <b>schematics and low-cost 2-layer PCBs</b> for our educational robotics kits: microcontroller boards, motor-driver modules, sensor breakouts and power boards. They’re built to be cheap to make, easy for students to assemble with a mix of through-hole and SMD parts, and clearly labelled for a classroom.',
      'I delivered a <b>multi-function robotics controller board</b>: an Arduino Nano carrier with dual H-bridge drivers for four motors, keyed connectors for ultrasonic, IR, light and RGB modules, switching regulators, and a protected two-cell Li-ion charger that runs from USB-C or a barrel jack.',
      'I built an <b>ESP32-S3 USB-host programmer for BBC micro:bits</b>. It has its own Li-ion charging, a switched 5 V rail that powers the micro:bit, a TFT screen and buttons, and firmware that mounts the micro:bit’s USB drive and copies .hex files onto it, over Wi-Fi or from on-board storage. No PC needed.',
      'I’m bringing up an <b>ESP32-S3 robotics main control board</b> (camera, audio codec, TFT, I/O expander and microSD) one part at a time. So far I’ve traced a camera that gave no frames to stuck data lines at its flex connector, and fixed an I²C port clash between the camera driver and the I/O expander.',
      'I planned the <b>two-board setup for a classroom humanoid robot</b>: an ESP32-S3 main controller and an ESP32-C6 that handles the encoder motors and servos. They talk over a CRC-checked link with a motor fail-safe, take OTA updates over the classroom network, and I sized the battery from the motors’ stall current.',
      'I do the <b>first bring-up and debugging</b> on new boards with a scope, logic analyser and multimeter: checking the rails, testing UART, I²C and SPI, measuring current draw, and chasing down shorts, unstable regulators and brown-outs. Then I write up what went wrong and how to fix it for the production team.',
    ],
    tags: ['EasyEDA', '2-layer PCB', 'ESP32-S3', 'USB host', 'Li-ion charging', 'H-bridge drive', 'Board bring-up', 'DSO / logic analyser', 'DFM'],
  },
  {
    from: 'Sep 2025', to: 'Mar 2026',
    role: 'PCB Design Intern',
    org: 'Unnova Systems Pvt Ltd — Grid OS',
    where: 'On-site · Noida, Uttar Pradesh',
    points: [
      'I moved to <b>Altium Designer</b> as my main tool there, and set up hierarchical schematics, parameterised symbols and footprints, layer stacks and rule-driven layout.',
      'I designed <b>2- and 4-layer PCBs</b> for LTE telematics units, OBD trackers and cellular sound boxes, fitting LTE, GSM, GNSS, Wi-Fi and Bluetooth modules with antenna keepouts, ground fencing and shielding for EMC.',
      'I did the <b>impedance-controlled routing</b> (50 Ω single-ended and 90 Ω differential), tuned and length-matched the differential pairs, and stitched vias along the high-speed USB and RF lines, choosing stripline or microstrip to keep loss and crosstalk down.',
      'I designed the <b>GNSS receiver front end</b> for the OBD trackers: the LNA bias for the active antenna, matching at the RF feed, and a keepout so the antenna could radiate and receive well.',
      'I laid out the <b>switching regulators and the audio codec</b> with careful decoupling, thermal vias, ferrite beads and RC and Pi filters, so supply noise stayed out of the radio and the audio.',
      'I released the <b>manufacturing files</b> (Gerber X2, NC drill, a test-point map, the impedance profile and the BOM) after DRC, DFM and DFA checks.',
    ],
    tags: ['Altium Designer', '4-layer PCB', 'Impedance control', 'GNSS / LTE', 'RF matching', 'EMC', 'Gerber X2', 'DFM / DFA'],
  },
  {
    from: '2018', to: '2022',
    role: 'Electronics Hardware Designer',
    org: 'Amigos Embedded',
    where: 'Guntur, India',
    points: [
      'I designed and prototyped <b>small electronics projects and single-layer PCBs</b> for STEM education and IoT experiments, from the circuit and part choice through to assembly and debugging.',
      'I ran <b>hands-on electronics workshops</b> where students learned embedded systems and hardware by building things.',
    ],
    tags: ['Prototyping', 'Single-layer PCB', 'STEM education', 'Workshops'],
  },
];

export const publication = {
  title: 'AgroSense ARIA: An Edge-AI Farming Operating System over a Self-Healing LoRa Mesh for Smallholder Agriculture',
  authors: 'Kotupalli Venkata Siva Teja, R. V. H. Prasad',
  venue: '4th International Conference on Intelligent Cyber Physical Systems and Internet of Things (ICoICI 2026), IEEE',
  where: 'Coimbatore, India',
  when: 'Sep 2026',
  note: 'First author',
};

export const education = [
  {
    from: 'Jan 2024', to: 'Jul 2026',
    degree: 'M.Tech — VLSI Design & Embedded Systems',
    org: 'Siddhartha Academy of Higher Education · V R S School of Engineering, Vijayawada',
    result: 'CGPA 7.58 / 10',
    tags: ['Semiconductor fabrication & packaging', 'FPGA & ML in VLSI', 'Cadence Virtuoso', 'Vivado', 'Capstone: AgroSense 1.0', 'Capstone: AgroSense 2.0'],
  },
  {
    from: 'Jan 2014', to: 'Dec 2018',
    degree: 'B.Tech — Electronics & Communication Engineering',
    org: 'Kalinga University, Raipur',
    result: '65 %',
    tags: ['Xilinx ISE 14.7', 'NI Circuit Design Suite', 'Final year: Network Rover', 'Night Vision Rover', 'Home Automation'],
  },
  {
    from: 'Jun 2012', to: 'Mar 2014',
    degree: 'Intermediate — MPC',
    org: 'Jupiter Junior College, Guntur',
    result: '70.1 %', tags: [],
  },
  {
    from: '', to: 'Mar 2012',
    degree: 'SSC',
    org: 'The Central Public School, Guntur',
    result: '8.7 GPA', tags: [],
  },
];

export const certifications = [
  { h: 'VLSI Design Flow — RTL to GDSII', org: 'NIELIT Centre of Excellence, Noida', when: 'Jul – Aug 2025' },
  { h: 'FPGA-Accelerated Machine Learning in VLSI', org: 'E&ICT', when: 'Feb 2025' },
  { h: 'Semiconductor Fabrication & Packaging Technology', org: 'E&ICT, under MeitY', when: 'Jan 2025' },
  { h: 'PCB Design Internship', org: 'Unnova Systems · Grid OS', when: '2025 – 2026' },
  { h: 'PCB Design Apprenticeship', org: 'Unnova Systems · Grid OS', when: '2025' },
  { h: 'AutoCAD 2015 — Certified User', org: 'Autodesk', when: '2015' },
  { h: 'Campus Ambassador Programme', org: 'IIT Delhi', when: '2018 – 2019' },
  { h: 'TCS iON Qualifier', org: 'Tata Consultancy Services', when: '2018' },
];

// core = bold in the CV
export const capabilities = [
  {
    h: 'PCB design',
    items: [
      ['Altium Designer', 1], ['EasyEDA', 0], ['KiCad', 0], ['Schematic capture', 0],
      ['2 / 4-layer PCB layout', 1], ['Impedance-controlled routing', 1],
      ['Differential pairs & length matching', 0], ['High-speed USB routing', 0],
      ['RF & mixed-signal layout', 1], ['Stackup design', 0], ['Power integrity', 0], ['DFM / DFA', 0],
      ['EMC-aware layout', 0], ['BOM & library management', 0], ['Antenna matching', 0],
      ['Component selection', 0]
    ],
  },
  {
    h: 'Power & protection',
    items: [
      ['Solar MPPT & Li-ion charging', 1], ['Power-path & load switching', 1],
      ['Buck, Boost & LDO regulators', 0], ['Current & power monitoring', 0],
      ['Overvoltage & undervoltage protection', 0], ['ESD & surge protection', 0],
      ['H-bridge motor drivers', 0], ['Reverse-polarity protection', 0],
      ['Power & thermal budgeting', 0]
    ],
  },
  {
    h: 'Embedded firmware',
    items: [
      ['ESP32-S3', 1], ['STM32', 0], ['Embedded C / C++', 1], ['Python', 0], ['ESP-IDF', 1],
      ['FreeRTOS', 0], ['Arduino', 0], ['USB host', 0], ['Sensor & peripheral drivers', 0],
      ['Low-power design', 0], ['Bootloaders & OTA updates', 0], ['AVR', 0], ['Raspberry Pi', 0],
      ['AES-128 encryption', 0], ['STM32CubeIDE', 0]
    ],
  },
  {
    h: 'Interfaces & protocols',
    items: [
      ['LoRa & mesh networking', 1], ['RS-485 / Modbus-RTU', 1], ['UART', 0], ['SPI', 0], ['I²C', 0],
      ['I²S', 0], ['USB', 0], ['CAN', 0], ['Wi-Fi', 0], ['BLE', 0], ['MQTT', 0], ['LTE / GSM', 0],
      ['GNSS', 0], ['RS-232', 0], ['REST APIs', 0], ['Ethernet', 0], ['TDMA scheduling', 0]
    ],
  },
  {
    h: 'Bring-up & test',
    items: [
      ['Board bring-up', 1], ['DSO & logic analyzer', 1], ['Fault isolation & debugging', 0],
      ['Signal integrity', 0], ['Functional & environmental testing', 0],
      ['Gerber, BOM & assembly outputs', 0], ['IPC-2221 / IPC-7351', 0], ['Multimeter', 0],
      ['Diagnostic test firmware', 0], ['IPC-A-610', 0], ['Design reviews', 0], ['Documentation', 0]
    ],
  },
  {
    h: 'VLSI & edge AI',
    items: [
      ['Verilog', 0], ['RTL-to-GDSII flow', 0], ['Static timing analysis', 0], ['Cadence Virtuoso', 0],
      ['Xilinx Vivado', 0], ['scikit-learn', 0], ['TensorFlow Lite', 0], ['LLM integration', 0],
      ['Yosys, Qrouter & Magic', 0], ['Flask', 0]
    ],
  },
  {
    h: 'Sensors & RF',
    items: [
      ['GNSS receiver front-end', 1], ['LNA bias networks', 0], ['Antenna matching', 1],
      ['U.FL / PCB antenna launch', 0], ['LTE / GSM modules', 0], ['IMU / accelerometer', 0],
      ['Environmental sensors', 0], ['Soil & NPK probes (RS-485)', 0],
      ['RTC with coin-cell backup', 0], ['microSD (SPI)', 0], ['Audio codecs & I²S amplifiers', 0],
      ['ADC / DAC', 0]
    ],
  },
  {
    h: 'AI & tooling',
    items: [
      ['Claude API (Anthropic SDK)', 1], ['Claude Code CLI integration', 0],
      ['LLM tool routing & function calling', 0], ['MCP tool servers', 1], ['3-tier LLM cascade', 0],
      ['Ollama / local LLMs', 0], ['System-prompt design', 0], ['Voice I/O (Vosk STT, Edge-TTS)', 0],
      ['Edge model deployment (TensorFlow Lite)', 1]
    ],
  },
];

// slug -> filter categories for the work grid
export const projectFilters = {
  'agrosense-aria': ['firmware', 'iot'],
  'agrosense-3': ['pcb', 'firmware'],
  'agrosense-2': ['pcb'],
  'agrosense-1': ['pcb'],
  'dletabotix': ['pcb', 'firmware', 'employer'],
  'grid-os': ['pcb', 'employer'],
  'alu-32bit': ['vlsi'],
  'arduino-nano-12v': ['pcb'],
  'network-rover': ['robotics', 'iot'],
  'night-vision-rover': ['robotics'],
  'bluetooth-rover': ['robotics'],
  'home-automation': ['iot'],
  'vacuum-robot': ['robotics'],
  'colophon': ['web'],
  'nrf54-altimeter': ['pcb', 'freelance'],
  'esp32-rev-d': ['pcb', 'freelance'],
};

export const filters = [
  ['all', 'All'], ['pcb', 'PCB design'], ['firmware', 'Firmware'], ['iot', 'IoT'],
  ['robotics', 'Robotics'], ['vlsi', 'VLSI'], ['employer', 'Employer work'], ['web', 'Web'],
];

// extra detail from the current CV that the old case studies predate
export const projectExtras = {
  'agrosense-aria': [
    'All seven ML models now run on the device, each with a simple rule-based fallback. Crop recommendation reaches 99.5 % across 22 classes, the FAO-56 evapotranspiration engine matches an independent reference at R² 0.97, and I raised anomaly detection from F1 0.42 to 0.96. The others cover disease detection, yield and fertiliser scheduling.',
    'The farmer assistant is a 3-tier LLM cascade (cloud, then CLI, then a local model) with speech in and out in English, Hindi and Telugu. Pump automation sits behind a four-level autonomy controller that logs every action and gives you 60 seconds to undo it.',
    'The node firmware covers environmental, IMU, soil-moisture and Modbus-RTU NPK sensors, fall and tilt detection, and RTC-alarm deep sleep. I’ve ported it to each board revision, and I built a Python desktop flasher that sets each node’s role, ID and channel at build time.',
    'In a four-node outdoor test, the links held about 30 dB of margin.',
  ],
  'agrosense-3': [
    'I’m now taking the latest revision toward a field-ready product in Altium Designer. It adds an input over-voltage disconnect, a hardware battery under-voltage cutoff that still lets the pack charge, load switches that stop sleep current leaking through the boost rails, and solar and battery power monitoring.',
    'I’ve backed it with worst-case calculations for every protection threshold, charge current, timing margin and hot spot, and a full check of the netlist against the BOM. That check caught a MOSFET whose gate threshold would have tripped the battery protection by mistake on a low pack.',
  ],
};
