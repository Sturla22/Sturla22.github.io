---
layout: post
title: "Requirements for a clock"
tags:
    - VHDL
    - HDL
    - FPGA
    - Clock Design
---

What does an alarm clock need? The one standing on my bedside table has the following features:

 - Clock display with two-step adjustable brightness
 - White/RGB light with adjustable brightness
 - FM radio (with horrible audio)
 - Alarm clock with 6 different tunes and the 7th switches on the radio
 - Touch button interface for setting the clock, adjusting the light, setting the radio station and volume, and setting your alarm
 - Regular buttons for setting volume, display brightness and choosing the alarm tune

## Design Constraints

Since I'll be reusing part of the hardware of my old clock, my constraints are clear. The interfaces to be supported are:

 - USB Micro - power input (the accompanying wall wart can supply 5W)
 - Display (4x 7-segment digits and some other artifacts)
 - Speaker (will need to figure out what specs it has and how to drive it)
 - Touch Buttons (set clock, set alarm, increase/decrease light brightness, switch light on/off, enable good-night mode, turn radio on/off, snooze button)
 - Buttons (increase/decrease volume, set alarm tune, set display brightness)
 - Radio (optional interface)
 - Battery power input (optional interface)
 - Lamp with adjustable brightness and color

## Feature Requests

 - To not have to set the clock every time it is unplugged or there is a power outage
 - Wireless interface [Bluetooth, ZWave or WiFi?] to allow control from mobile

## System Architecture

 - Clock enclosure with interfaces specified above
 - FPGA that replaces the original clock electronics
 - Wireless interface for mobile control

## Requirements

[RFC2119](https://tools.ietf.org/html/rfc2119) defines words that should be used when writing requirements.

Requirements should be Clear, Concise, Correct, Coherent, Complete and Confirmable. They should also be marked with a label for traceability.

Providing rationale for requirements can be very helpful. Requirements are not set in stone, especially not at the beginning of a project, but eventually they will need to settle to make sure the project can be finished at some point.

### System Requirements

CLOCK_001a: The design must get its power from a USB micro port on the enclosure.
  - _Rationale_: This is how the clock works currently. Reusing the enclosure and there is no reason to change.

CLOCK_001b: The power input voltage shall be 5VDC.
  - _Rationale_: This is how the clock works currently, using the USB micro port more or less enforces 5VDC input.

CLOCK_002a: The design must not consume more than 5W of power.
  - _Rationale_: This is how the clock works currently, the power converter that came with the clock is 1A@5V.

CLOCK_002c: The current shall not be above 1A within 1 second of powering the design on.
  - _Rationale_: This is to limit the energy of the inrush current peak. The values are guesstimates.
  - **TODO**: Investigate appropriate time limit for inrush current.

CLOCK_002b: The inrush current of the design must not exceed 2A at the power input
  - _Rationale_: I don't know really, it just seems to make sense to set an upper limit to the inrush current.
  - **TODO**: Investigate appropriate maximum inrush current based on wire thickness among other parameters.

CLOCK_003: The design shall display the set time on 4 7-segment digits.
  - _Rationale_: This is how the clock works currently. Reusing the enclosure and display.

CLOCK_004: When the alarm has been set, the design shall indicate that the alarm is active.
  - _Rationale_: This is how the clock works currently. Reusing the enclosure and display. Showing that the alarm has been set is useful.

CLOCK_005: The design shall play sound through the speaker when the alarm occurs.
  - _Rationale_: This is how the clock works currently. Reusing the enclosure and speaker.

CLOCK_006: The design shall keep track of time when not powered.
  - _Rationale_: This is **not** how the clock works currently, new functionality in response to feature request.

CLOCK_007: The brightness of the lamp shall be adjustable.
  - _Rationale_:

CLOCK_008: The design's lamp shall turn on before the alarm, starting with the lowest brightness at a configurable time before the alarm. The lamp shall have reached the maximum brightness ahead of the alarm.
  - _Rationale_:

CLOCK_009: The design may operate from 4xAA batteries.
  - _Rationale_:

CLOCK_010: The design may receive FM radio and play it through the speaker.
  - _Rationale_:

### Functional Requirements

All of the system requirements?

### Non-Functional Requirements

None?

```
from: https://reqtest.com/requirements-blog/functional-vs-non-functional-requirements/
Some typical non-functional requirements are:

    Performance – for example Response Time, Throughput, Utilization, Static Volumetric
    Scalability
    Capacity
    Availability
    Reliability
    Recoverability
    Maintainability
    Serviceability
    Security
    Regulatory
    Manageability
    Environmental
    Data Integrity
    Usability
    Interoperability

Non-functional requirements specify the system’s ‘quality characteristics’ or ‘quality attributes’.
```

## Hardware
### Hardware Architecture

### Hardware Requirements

## Firmware
### Firmware Architecture

### Firmware Requirements

## Software
### Software Architecture

### Software Requirements
