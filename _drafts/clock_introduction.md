---
layout: post
title: "Clock Design Introduction"
tags:
    - VHDL
    - HDL
    - FPGA
    - Clock Design
---


 Join me on an adventure of discovery in to the land of VHDL and FPGAs!

## Who Am I?

 Sturla Lange, BSc Electrical Engineer from the University of Iceland, Reykjavik and MSc in Embedded Electronics from KTH, Stockholm. I am currently employed as an Hardware Engineer at Alstom, although nothing in these blog series represents Alstom's views, they are mine and mine alone.

## What Is This?

 This is the beginning of a blog series about VHDL and primarily its use for FPGA designs. Since I am interested in tooling and continuous improvement, the focus will be somewhat geared towards setting up an environment for VHDL development that will enable high quality, but also consistent quality.

## Why Is This?

 As part of my learning process in connection to professional projects I have become interested in the best practices within the development of VHDL code for FPGAs but also in the possibility of applying best practices based on my experience with developing Embedded Software.

## What Is My Environment?

 Since this is an exercise performed at home without any commercial support, I will be using free and open source tools where they are available. Where no other options are available I might need to use proprietary tools that offer free licenses. I run the tools on a linux box, but most should run fine on Windows, albeit probably with a bit more elbow grease.

## What Are We Going To Be Using As A Reference Design?

 As this is a learning experiment rather than a part of some focused development project, I get to choose a simple design to test my ideas on! Perhaps looking into several different modules over the course of the series will be needed to get the complexity up to be representative of anything other than theoretical ruminations. Eventually it would be interesting to manufacture a PCB and do Hardware-in-the-Loop testing.

 The VHDL modules I expect to look into are:

  - Adders (HA, FA), to cover the very basics
  - Filters (FIR), to get into some interesting features and opportunities
  - Finite State Machines, since that is a common design pattern used in HDLs
  - Interfaces (SPI, I2C, I2S), to get into what seems to be the real complexity inducing part of FPGA design
  - A soft core (RISC V or another open source core), since that seems like great fun

## Alright.. but what are you going to build?

 How about an alarm clock with a wake-up light? I have a rather dull one with a boring interface, time to 'Pimp My Clock', yes I got silly shivers writing this too, no worries.

## What Will the Design Process Look Like?

 Following a typical safety-critical design process is likely to ensure high quality. The automotive industry and general industrial safety standards use a `V` shaped design process. The top left defines the requirements for the system, as the process moves down the left leg of the `V`, the requirements are broken down until appropriately clear for implementation at the bottom of the `V`. Continuing up the right leg of the `V`, the requirements at each level are tested against the relevant implemented part, all the way up to the system level and system  tests at the top right of the 'V'.

 This is the process that this blog series will follow, but in addition we will use steps from the Design Thinking methodology to ensure that we actually get what we want.

## Design Thinking

The steps for design thinking are roughly:

  1. Figure out what problem you want to solve and get to know the problem deeply
  2. Figure out who the stakeholders are and what they want from the solution
  3. Brainstorming/ideation
  4. Prototyping
  5. Testing the solution

Combining this with the safety-critical design process can be done by starting with the 3 first steps and writing requirements based on the results. Then steps 4 and 5 can be considered to be the traversal through the `V`. In a real project, the prototype and testing of it should most likely be done without following the safety process to get valuable insights into the problem before starting work on the final design and following the safety design process rigorously, making sure to scrap the prototype before starting work on the final design. However, this design will not be produced.. it will only be a single prototype for me, so making a prototype for a prototype doesn't make much sense to me.

### What's your problem?

One approach to identifying a root cause and making sure you understand the problem deeply is the 5-7 whys:

  1. Why do you want an alarm clock? **A**: Because the one I have doesn't work the way that I want.
  2. Why is that? **A**: The interface is limited.
  3. Why is the interface limited? **A**: You can only fit so many buttons on the area of the clock enclosure.
  4. Why did the designers choose buttons? **A**: Buttons are a simple and cheap method of interacting with devices.
  5. Why are they cheap? **A**: Other methods require more hardware and more logic.

Adjusting the questions and finding answers is harder than it seems.. Let's try another perspective:

  1. Why do you need an alarm clock with a wake-up lamp? **A**: Because where I live, the mornings can be dark, making it hard to wake up.
  2. Why does that make it hard to wake up? **A**:

### Who are the stakeholders and what do they want?

Hi! I'm the stakeholder, and I guess my partner is a stakeholder too.

Me:

  - I hate having to set the clock every time it loses power
  - I think the interface is annoying, would like to be able to configure with a richer interface

Anna:

  - She hates the fact that the radio turns off after 2 minutes when set to play on the alarm

### Generate as many ideas as you can.. GO!

  - Real Time Clock module
  - Bluetooth - to get a richer interface
  - WiFi - to get a richer interface
  - Custom SW/FW - to get around the interface limitation and the radio for 2 minutes configuration

## Requirements

  In the next chapter I will define the requirements for the clock.
