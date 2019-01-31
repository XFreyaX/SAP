// ==UserScript==
// @name         ShareAlliancePost_NonSend
// @namespace    Leitstellenspiel
// @version      4.0.4
// @author       x_Freya_x, jalibu (Original), JuMaHo (Original)
// @include      https://www.leitstellenspiel.de/missions/*
// ==/UserScript==

(() => {
    'use strict';

    function leapYear (year){
        return (year & 3) == 0 && ((year % 25) != 0 || (year & 15) == 0);
    }

    function OffTime (ueT, Os){
        var DoM = [31,26,31,30,31,30,31,31,30,31,30,31];
        let vT = ueT;

        let vDateD = vT.getDate();
        let vDateM = vT.getMonth() + 1;
        let vDateY = vT.getFullYear();
        let DoMA = DoM[vDateM - 1];
        DoMA += leapYear(vDateY) ? 1 : 0;
        let vDateHo = vT.getHours();
        let vDateMi = vT.getMinutes();

        let HoOs = vDateHo + Os;
        let ueTH = HoOs >= 24 ? 1 : 0;
        HoOs -= ueTH ? 24 : 0;
        let vHo = '';
        vHo += HoOs < 10 ? '0' + HoOs : '' + HoOs;

        let DOs = vDateD + ueTH;
        let ueTD = (DOs > DoMA) ? 1 : 0;
        DOs = (DOs > DoMA) ? 1 : DOs;
        let vD = '';
        vD += DOs < 10 ? '0' + DOs : '' + DOs;

        let MOs = vDateM + ueTD;
        let ueTM = (MOs > 12) ? 1 : 0;
        MOs -= (MOs > 12) ? 12 : 0;
        let vM = '';
        vM += vDateM < 10 ? '0' + vDateM : '' + vDateM;

        let vY = vDateY + ueTM;

        let vMi = '';
        vMi += vDateMi < 10 ? '0' + vDateMi : '' + vDateMi;

        vD += '.' + vM + '.' + vY + ' / ' + vHo + ':' + vMi +' Uhr';
        return vD;
    }

    const jumpNext = false; // Set to 'true', to jump to next mission after submitting an alert.
    const enableKeyboard = true; // Set to 'false', to disable keyboard shortcuts.
    const shortcutKeys = [17, 89]; // 17 = ctrl, 68 = d
    const defaultPostToChat = false; // Set to 'false', to disable default post in alliance chat.
    const messages = ['%ESZ%',
                      '%ESZ% - Offen bis %MY_CUSTOM_TIME%. Sonst alles gemäß Regeln !!!',
                      '[EVENT] %ESZ% - Hat offen zu bleiben bis %MY_CUSTOM_TIME2% !!!',
                      '%ESZ% - %ADDRESS% - %FRE%',
                      '%ESZ% - %ADDRESS% - %FZ1% und alles gemäß Regeln !!!', // Default
                      '%ESZ% - %ADDRESS% - %FZ1% !!! Letztes Fahrzeug nicht vor %MY_CUSTOM_TIME4% losschicken !!!',
                      '%ESZ% - kein ELW vor %MY_CUSTOM_TIME4%',
                      '%ESZ% - Weitere Kräfte in %ADDRESS% benötigt. Alles gemäß Regeln !!!',
                      '%ESZ% - Weitere Kräfte in %ADDRESS% benötigt. RD NUR durch mich - alles gemäß Regeln !!!',
                      '%ESZ% - Weitere Kräfte in %ADDRESS% benötigt. RD frei - alles gemäß Regeln !!!',
                      '%ESZ% - Offen bis %MY_CUSTOM_TIME%. RD NUR durch mich - alles gemäß Regeln !!!',
                      '%ESZ% - Unterstützung in %ADDRESS% benötigt. Offen bis %MY_CUSTOM_TIME%.',
                      '%ESZ% - EILT !!! Weitere Kräfte in %ADDRESS% benötigt.',
                      // '%REQUIRED_VEHICLES% in %ADDRESS% noch benötigt',
                      'RD für %PATIENTS_LEFT% Patienten in %ADDRESS% benötigt.',
                      'EILT !!! RTH in %ADDRESS% benötigt.',
                      'EILT !!! Hummel in %ADDRESS% benötigt.',
                      '%ADDRESS% - %FRE0%',
                      '+++ Gesponsorte GSL Nr.  --- kein ELW vor %MY_CUSTOM_TIME4% !!!',
                      // 'EILT !!! %REQUIRED_VEHICLES% in %ADDRESS% noch benötigt'];
                      ];

    // Create Button and add event listener
    const initButtons = () => {
        let btnMarkup1 = '<div class="btn-group" style="margin-left: 5px; margin-right: 5px;">';
        btnMarkup1 += '<a href="#" class="btn btn-success btn-sm alert_notify_alliance" title="Alarmieren, im Verband freigeben und Nachricht in Verbands-Chat">';
        btnMarkup1 += '<img class="icon icons8-Phone-Filled" src="/images/icons8-phone_filled.svg" width="18" height="18">';
        btnMarkup1 += '<img class="icon icons8-Share" src="/images/icons8-share.svg" width="20" height="20">';
        btnMarkup1 += '<span class="glyphicon glyphicon-bullhorn" style="font-size: 13px;"></span>';
        btnMarkup1 += '</a></div>';
        let btnMarkup2 = '<div class="btn-group" style="margin-left: 5px; margin-right: 5px;">';

        let optionsBtnMarkup = '<a href="#" id="openAllianceShareOptions" class="btn btn-sm btn-default" title="Einstellungen" style="margin: 0">';
        optionsBtnMarkup += '<span class="glyphicon glyphicon-option-horizontal"></span></a>';
        optionsBtnMarkup += '<div class="btn btn-sm btn-default" style="margin:0; padding: 1px; display: none;" id="allianceShareOptions"><input type="text" id="allianceShareText" value="' + messages[4] + '">';
        optionsBtnMarkup += '<label style="margin-left: 2px; margin-right: 2px;"><input type="checkbox" ' + (defaultPostToChat ? 'checked' : '') + ' id="postToChat" name="postToChat" value="true">An VB Chat?</label>';
        optionsBtnMarkup += '<div style="text-align: left;"><ul>';
        $.each(messages, (index, msg) => {
            optionsBtnMarkup += '<li class="customAllianceShareText">' + msg + '</li>';
        });
        optionsBtnMarkup += '</ul></div>';
        optionsBtnMarkup += '</div>';

        $('.alert_next_alliance').parent().append(btnMarkup1);

        $('.alert_notify_alliance').first().parent().prepend(optionsBtnMarkup);

        $('#openAllianceShareOptions').click(() => {
            $('#allianceShareOptions').show();
            $('#openAllianceShareOptions').hide();
        });


        $('.customAllianceShareText').click(function() {
            $('#allianceShareText').val($(this).text());
        });


        if(jumpNext){
            $('.alert_notify_alliance').append('<span style="margin-left: 5px;" class="glyphicon glyphicon-arrow-right"></span>');
        }

        $('.alert_notify_alliance').click(processAllianceShare);

    };

    // Add Keylisteners
    const initKeys = () => {
        if(enableKeyboard){
            let keys = [];

            $(document).keydown((e) => {
                keys.push(e.which);
                if(keys.length >= shortcutKeys.length){
                    let pressedAll = true;
                    $.each(shortcutKeys, (index, value) =>{
                        if(keys.indexOf(value) < 0){
                            pressedAll = false;
                            return;
                        }
                    });
                    if(pressedAll){
                        // Is there an extra key pressed?
                        if(keys.length > shortcutKeys.length){
                            // Remove regular (expected pressed) keys from list
                            let extraKey =  keys.filter( ( el ) => !shortcutKeys.includes( el ) );
                            // As number 9 key has value 48, substract that to get an expected key (value) range from 1-9
                            extraKey = extraKey[extraKey.length - 1] - 48;
                            // If the extra button has the (value) number 1-9,
                            // and the message array as a corresponding number of messages, select it
                            if(extraKey > 0 && extraKey <=10 && extraKey <= messages.length){
                                $('#allianceShareText').val(messages[extraKey - 1]);
                            }
                        }

                        processAllianceShare();

                    }
                }
            });

            $(document).keyup((e) => {
                keys.splice(keys.indexOf(e.which));
            });
        }
    };

    const processAllianceShare = () => {

        $('#allianceShareOptions').hide();
        $('#openAllianceShareOptions').show();

        const sendToAlliance = $('#postToChat').is(':checked') ? 1 : 0;
        const missionShareLink = $('#mission_alliance_share_btn').attr('href');
        const missionId = missionShareLink.replace('/missions/','').replace('/alliance', '');
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        const message = $('#allianceShareText').val();

        $('.alert_notify_alliance').html('Teilen..');
        $.get('/missions/' + missionId + '/alliance' , () => {
            $('.alert_notify_alliance').html('Chatten..');
            $.post( "/mission_replies", {authenticity_token: csrfToken, mission_reply: {alliance_chat: sendToAlliance, content: message, mission_id: missionId}}, (data, status, xhr) => {
                $('.alert_notify_alliance').html('Alarmieren..');
                if(jumpNext){
                    $('.alert_next').first().click();
                } else {
                    $('#mission_alarm_btn').click();
                }
            } );
        });

    };

    const transformMessages = () => {
        try {
            
            const vers = '(SAP_NS 4.0.4)';

            // Prepare values for %ADDRESS% and %PATIENTS_LEFT%
            // Possible inputs 'xy street, 1234 city', '1234 city', '123 city | 2' (where 2 is number of patients)
            let addressAndPatrientRow = $('.mission_header_info >> small').first().text().trim().split(',');
            addressAndPatrientRow = addressAndPatrientRow[addressAndPatrientRow.length-1].split('|');
            const adr = addressAndPatrientRow[0];
            let address = adr.slice(0, 6);
            const patientsLeft = addressAndPatrientRow.length === 2 ? addressAndPatrientRow[1] : 0;

            const aDate = new Date();

            // Prepare values for %AKTDATE%
            const AD = OffTime(aDate, 0);

            // Prepare values for %MY_CUSTOM_TIME%
            const MCT = OffTime(aDate, 5);

            // Prepare values for %MY_CUSTOM_TIME2%
            const MCT2 = OffTime(aDate, 3);

            // Prepare values for %MY_CUSTOM_TIME4%
            const MCT4 = OffTime(aDate, 6);

            // Prepare required Vehicles
            const alertText = $('.alert-danger');
            const requiredVehiclesIdentifier = 'Zusätzlich benötigte Fahrzeuge:';
            let requiredVehicles = 'Keine weiteren Fahrzeuge benötigt.';
            if(alertText && alertText.text().indexOf(requiredVehiclesIdentifier) >= 0){
                requiredVehicles = alertText.text().trim().substr(requiredVehiclesIdentifier.length, alertText.text().trim().length-1);
            }

            for(let i = 0; i<messages.length; i++){
                messages[i] = messages[i].replace('%ADDRESS%', 'PLZ: ' + address);
                messages[i] = messages[i].replace('%PATIENTS_LEFT%', patientsLeft);
                messages[i] = messages[i].replace('%REQUIRED_VEHICLES%', requiredVehicles);
                messages[i] = messages[i].replace('%ESZ%', vers + ' ESZ: ' + AD);
                messages[i] = messages[i].replace('%EIL%', 'EILT !!!');
                messages[i] = messages[i].replace('%FRE%', 'Frei zum Mitverdienen gemäß Regeln !!!');
                messages[i] = messages[i].replace('%FRE0%', vers + ' 🚨 Credits 🚒 - ⚠️🚫🚫 NO non-required vehicles before all required vehicles are on scene 🚫🚫⚠️');
//                messages[i] = messages[i].replace('%FZ1%', 'Jeder nur 1 Fahrzeug');
                messages[i] = messages[i].replace('%FZ1%', 'Denkt an Eure Mitspieler');
                messages[i] = messages[i].replace('%AKTDATE%', AD);
                messages[i] = messages[i].replace('%MY_CUSTOM_TIME%', MCT);
                messages[i] = messages[i].replace('%MY_CUSTOM_TIME2%', MCT2);
                messages[i] = messages[i].replace('%MY_CUSTOM_TIME4%', MCT4);
            }
        } catch (e){
            console.log('Error transforming messages: ' + e);
        }
    };

    transformMessages();
    initButtons();
    initKeys();
})();
