# GHT-Buchungssystem: Documentation

This page contains all information required to learn about the program's structure, functionality and how to modify it.

## Index

-   [Interactions](#interactions)
    -   [Getting user information](#getting-user-information)
    -   [Booking a device](#booking-a-device)
    -   [Returning a device](#returning-a-device)
-   [Preparing for executing](#preparing-for-execution)
    -   [Required hardware](#required-hardware)
    -   [Enabling SPI](#enabling-spi)
    -   [Node.js](#nodejs)
        -   [Debian and Ubuntu](#debian-and-ubuntu)
        -   [Other system](#other-system)
    -   [Yarn](#yarn)
    -   [Building the UI](#building-the-ui)
-   [Running the program](#running-the-program)
-   [Configuration](#configuration)
-   [Structure](#structure)

## Interactions

### Getting user information

In order to get some information about the user that belongs to a chip, simply hold it against the RFID reader and the UI will display information about the user:

-   The users last few booked devices
-   The currently booked device
-   The length of the current booking
-   If the user can book another device

If no other interactions follow, the user will be automatically logged out 15 seconds later (this time can be configured in the [configuration](#configuration)). The user can also manually log out by placing his chip again against the RFID reader.

### Booking a device

In order to book a device, the user first has to place his own chip against the RFID reader which will display his [information](#getting-user-information) and then has to place the chip/sticker/card of an device against the RFID reader before the user is logged out again.

### Returning a device

In order to return a device, the device chip/sticker/card just needs to be placed against the RFID reader whilst no user is logged in.

## Preparing for execution

### Required hardware

To run the program, a Raspberry Pi with a working internet connection is required.

Also, an [rc522 RFID](https://www.reichelt.de/entwicklerboards-rfid-modul-nxp-mfrc-522-debo-rfid-rc522-p192147.html?CCOUNTRY=445&LANGUAGE=de&trstct=pos_0&nbc=1&&r=1) reader is required which needs to be connected to the Raspberry Pi in following order except the 3.3v pin is directly connected to the Rasperry Pi, so we need no DC to DC regulator (5V to 3.3V).
Also, a is required. This buzzer needs 5V and needs to be active, when connected to the Raspberry Pi 3 (Modell B) directly. Instead of the s8050 transistor we used the [bc547](https://www.reichelt.de/bipolartransistor-npn-45v-0-1a-0-5w-to-92-bc-547c-p5007.html?&trstct=pos_4&nbc=1) because we still had it and a [1kΩ resistor](https://www.reichelt.de/widerstand-metallschicht-1-00-kohm-0207-0-6-w-1--metall-1-00k-p11403.html?&trstct=pos_6&nbc=1).
If you use [this Buzzer](https://www.reichelt.de/entwicklerboards-summer-aktiv-debo-buzzer-a2-p282660.html?&trstct=pos_6&nbc=1) you need no transistor.

> ![Raspberry Pi RFID rc522 reader connection and buzzer](https://github.com/firsttris/mfrc522-rpi/raw/master/wiki/mfrc522-node.png)  
> _Source: https://www.npmjs.com/package/mfrc522-rpi_

Despite the image suggesting that the pin configuration is for an Raspberry Pi 2, it is also tested to be working with an Raspberry Pi 3 (Modell B)

### Enabling SPI

The program requires the SPI ports of the Raspberry Pi to be enabled in order to read the RFID reader.  
If you are on Raspbian (a for Raspberry Pi optimized fork of Debian) you can simply run

```console
$ sudo raspi-config
```

and enable it via a graphical configuration menu.  
Otherwise, the spi can be enabled by ensuring the following lines are not commented out in the `/boot/config.txt` file

```ini
dtparam=spi=on
```

### Node.js

The program requires at least the version 16 of the [node.js](https://nodejs.org/) runtime. This is required in order to execute the JavaScript code of which the program consists.

#### Debian and Ubuntu

Installing for Debian and Ubuntu is described in here:  
https://github.com/nodesource/distributions/blob/master/README.md#debinstall

#### Other system

The installation for other system is described in here:  
https://nodejs.org/en/download/package-manager/

### Yarn

The whole programs presumes that yarn is installed. This is a very easy thing as it can be easily installed using the node package manager (npm).

```console
$ npm install -g yarn
```

This command will install yarn globally on the machine and allows the use of it in all parts of the program.

For a more detailed explanation visit the yarn installation guid:  
https://yarnpkg.com/getting-started/install

### Building the UI

The next step is the building of the UI. This is a very easy thing. Navigate into the `client` directory and execute the following commands

```console
$ yarn
$ yarn build
```

That will first install all required dependencies for the UI and then build the UI into the `client/dist` directory. That directory (and it's content) is required to display the UI.

More build options for the client can be found in here:  
[/client/README.md](client/README.md)

## Configuration

There are a few configuration options available, these can be found in `.env.example`. In order to set the configuration, create a new file called `.env` or `.env.local`, in that file place the following options as shown in `.env.example`

| Configuration Option | Description                                                                      | Type   |
| -------------------- | -------------------------------------------------------------------------------- | ------ |
| `UI_PORT`            | The port the UI server is running on                                             | Number |
| `API_URL`            | The URL to the backend API server                                                | String |
| `READ_TIMEOUT`       | The timeout between the read of the same chip (in milliseconds)                  | Number |
| `READ_CYCLE`         | How often the value gets read from the reader (in milliseconds)                  | Number |
| `LOGOUT_TIMEOUT`     | How long it takes after the user gets automatically logged out (in milliseconds) | Number |

The program does not allow for options to be missing from the configuration as it will throw an error at runtime.

## Running the program

**WARNING:** Please make sure that the [configuration](#configuration) is properly set up.

After setting up and checking that all the [prerequisites](#preparing-for-execution) have been met, run the following command

```console
$ yarn
```

to install all the required dependencies and then run

```console
$ yarn start
```

To start the program.

if you want to run the application in debug mode with hot-reloading for development purposes, run it with the following command

```console
$ yarn dev
```

## Structure

The program follows the following structure:

-   `/`  
    Configuration, dependency management and program description
    -   `/src`  
        Application initialization code and manager class
        -   `/src/config`  
            Logger configuration
        -   `/src/lib`  
            Small libs and manager/wrapper classes
        -   `/src/routes`  
             Routes for the UI server
            -   `/src/routes/ui`  
                WebSocket endpoint and events
    -   `/client`  
        Configuration, dependency management and client description
        -   `/client/src`  
            UI initialization code and [vue.js](https://vuejs.org/) type definitions
            -   `/client/src/assets`  
                Assets such as images used in the UI
            -   `/client/src/components`  
                Components ([vue.js](https://vuejs.org/)) used through out the UI
            -   `/client/src/router`  
                Route definitions for the different UI pages
            -   `/client/src/views/UI`  
                Views for the different pages of the UI

---

<img src="https://matix-media.net/media/logo.svg" style="float:left;margin-right:20px;" height="50px" />

Released under the [MIT License](LICENSE)  
Copyright &copy; 2021 Max Heilmann
