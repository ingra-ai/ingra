export const mockGoogleCalendarListEventResponse = {
    "config": {
        "url": "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2024-03-17T13%3A00%3A00.000Z&timeMax=2024-03-18T12%3A59%3A00.000Z&maxResults=5&singleEvents=true&orderBy=startTime&timeZone=Australia%2FSydney",
        "method": "GET",
        "userAgentDirectives": [
            {
                "product": "google-api-nodejs-client",
                "version": "7.0.1",
                "comment": "gzip"
            }
        ],
        "headers": {
            "x-goog-api-client": "gdcl/7.0.1 gl-node/18.19.0",
            "Accept-Encoding": "gzip",
            "User-Agent": "google-api-nodejs-client/7.0.1 (gzip)",
            "Authorization": "Bearer ya29.a0Ad52N3_nVujVoV9RABsuyxBEMUZf9s1j8iCGtAdYwgmszvGK3Mab5gg9GyfifeDoKXZvYWGSI6LSZlZR8bKSDzfBDGNNNFS2FX_UI6TR-C9qCKuwxRMongvHZR9u5vI-H1Ef3_00ZellCzQrDB8XOQ7qyxAcrUBsDm0m8waCgYKAd4SARESFQHGX2MiQOYozy9asdm74toKpHcvDQ0173"
        },
        "params": {
            "timeMin": "2024-03-17T13:00:00.000Z",
            "timeMax": "2024-03-18T12:59:00.000Z",
            "maxResults": 5,
            "singleEvents": true,
            "orderBy": "startTime",
            "timeZone": "Australia/Sydney"
        },
        "retry": true,
        "responseType": "unknown"
    },
    "data": {
        "kind": "calendar#events",
        "etag": "\"p33oabfm6hnr880o\"",
        "summary": "vtaslim@solutiondigital.biz",
        "description": "",
        "updated": "2024-03-15T10:55:32.918Z",
        "timeZone": "Australia/Sydney",
        "accessRole": "owner",
        "defaultReminders": [
            {
                "method": "popup",
                "minutes": 10
            }
        ],
        "items": [
            {
                "kind": "calendar#event",
                "etag": "\"3370986246126000\"",
                "id": "2jcvi3fq9csms9fb01rsgphg2i_20240317T210000Z",
                "status": "confirmed",
                "htmlLink": "https://www.google.com/calendar/event?eid=MmpjdmkzZnE5Y3NtczlmYjAxcnNncGhnMmlfMjAyNDAzMTdUMjEwMDAwWiB2dGFzbGltQHNvbHV0aW9uZGlnaXRhbC5iaXo&ctz=Australia/Sydney",
                "created": "2023-05-31T00:32:03.000Z",
                "updated": "2023-05-31T00:32:03.063Z",
                "summary": "Morning Kickoff",
                "description": "Email, Backlog, and Code Review",
                "creator": {
                    "email": "vtaslim@solutiondigital.biz",
                    "self": true
                },
                "organizer": {
                    "email": "vtaslim@solutiondigital.biz",
                    "self": true
                },
                "start": {
                    "dateTime": "2024-03-18T08:00:00+11:00",
                    "timeZone": "Australia/Sydney"
                },
                "end": {
                    "dateTime": "2024-03-18T09:00:00+11:00",
                    "timeZone": "Australia/Sydney"
                },
                "recurringEventId": "2jcvi3fq9csms9fb01rsgphg2i",
                "originalStartTime": {
                    "dateTime": "2024-03-18T08:00:00+11:00",
                    "timeZone": "Australia/Sydney"
                },
                "iCalUID": "2jcvi3fq9csms9fb01rsgphg2i@google.com",
                "sequence": 0,
                "guestsCanModify": true,
                "reminders": {
                    "useDefault": false
                },
                "eventType": "default"
            },
            {
                "kind": "calendar#event",
                "etag": "\"3420976322898000\"",
                "id": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g84o30cq4850jeh1n6sr48g9g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g651jge1j84rkcc9i6d0k6h9k6h142dpj74qk4cpg6l0kae228oqg",
                "status": "confirmed",
                "htmlLink": "https://www.google.com/calendar/event?eid=XzYwcTMwYzFnNjBvMzBlMWk2MG80YWMxZzYwcmo4Z3BsODhyajJjMWg4NHMzNGg5ZzYwczMwYzFnNjBvMzBjMWc4NG8zMGNxNDg1MGplaDFuNnNyNDhnOWc2NG8zMGMxZzYwbzMwYzFnNjBvMzBjMWc2MG8zMmMxZzYwbzMwYzFnNjUxamdlMWo4NHJrY2M5aTZkMGs2aDlrNmgxNDJkcGo3NHFrNGNwZzZsMGthZTIyOG9xZyB2dGFzbGltQHNvbHV0aW9uZGlnaXRhbC5iaXo&ctz=Australia/Sydney",
                "created": "2024-03-15T07:34:34.000Z",
                "updated": "2024-03-15T07:36:01.449Z",
                "summary": "Unfreeze Inspiration Bug Triage ",
                "description": "Hello All,\n\nSetting up this meeting for bug triaging of the unfreeze inspiration. Your support is appreciated.\n\n\nJoin Zoom Meeting\nhttps://url.au.m.mimecastprotect.com/s/jsXDCoV5yXcjprU10bfl?domain=breville.zoom.us\n\nMeeting ID: 940 3126 5624\n\n---\n\nOne tap mobile\n+61370182005,,94031265624# Australia\n+61731853730,,94031265624# Australia\n\n---\n\nDial by your location\n• +61 3 7018 2005 Australia\n• +61 7 3185 3730 Australia\n• +61 8 6119 3900 Australia\n• +61 8 7150 1149 Australia\n• +61 2 8015 6011 Australia\n• +1 929 205 6099 US (New York)\n• +1 253 205 0468 US\n• +1 253 215 8782 US (Tacoma)\n• +1 301 715 8592 US (Washington DC)\n• +1 305 224 1968 US\n• +1 309 205 3325 US\n• +1 312 626 6799 US (Chicago)\n• +1 346 248 7799 US (Houston)\n• +1 360 209 5623 US\n• +1 386 347 5053 US\n• +1 507 473 4847 US\n• +1 564 217 2000 US\n• +1 646 931 3860 US\n• +1 669 444 9171 US\n• +1 669 900 6833 US (San Jose)\n• +1 689 278 1000 US\n• +1 719 359 4580 US\n• +1 778 907 2071 Canada\n• +1 780 666 0144 Canada\n• +1 204 272 7920 Canada\n• +1 438 809 7799 Canada\n• +1 587 328 1099 Canada\n• +1 647 374 4685 Canada\n• +1 647 558 0588 Canada\n• 855 703 8985 Canada Toll-free\n• +44 208 080 6592 United Kingdom\n• +44 330 088 5830 United Kingdom\n• +44 131 460 1196 United Kingdom\n• +44 203 481 5237 United Kingdom\n• +44 203 481 5240 United Kingdom\n• +44 203 901 7895 United Kingdom\n• +44 208 080 6591 United Kingdom\n• +49 69 3807 9883 Germany\n• +49 69 3807 9884 Germany\n• +49 69 5050 0951 Germany\n• +49 69 5050 0952 Germany\n• +49 695 050 2596 Germany\n• +49 69 7104 9922 Germany\n• +852 5803 3730 Hong Kong SAR\n• +852 5803 3731 Hong Kong SAR\n• +852 5808 6088 Hong Kong SAR\n• +852 3008 3297 Hong Kong SAR\n• +852 3012 6283 Hong Kong SAR\n• 400 616 8835 China Toll-free\n• 400 669 9381 China Toll-free\n• +64 3 659 0603 New Zealand\n• +64 4 886 0026 New Zealand\n• +64 9 884 6780 New Zealand\n• +91 22 48 798 004 India\n• +91 22 71 279 525 India\n• +91 80 71 279 440 India\n• +420 2 2888 2388 Czech Republic\n• +420 2 3901 8272 Czech Republic\n• +420 5 3889 0161 Czech Republic\n• +52 554 169 6926 Mexico\n• +52 556 826 9800 Mexico\n• +52 558 659 6001 Mexico\n• +52 558 659 6002 Mexico\n• +52 554 161 4288 Mexico\n• +39 020 066 7245 Italy\n• +39 021 241 28 823 Italy\n• +39 069 480 6488 Italy\n• 800 088 202 Italy Toll-free\n• 800 790 654 Italy Toll-free\n• +82 2 3143 9611 Korea, Republic of\n• +82 2 3143 9612 Korea, Republic of\n• 00 308 321 0267 Korea, Republic of Toll-free\n\nMeeting ID: 940 3126 5624\n\nFind your local number: https://url.au.m.mimecastprotect.com/s/jDOACp832Lu1EnSDm10d?domain=breville.zoom.us\n\n---\n\nJoin by SIP\n• 94031265624@zoomcrc.com\n\n---\n\nJoin by H.323\n• https://url.au.m.mimecastprotect.com/s/4kxACq73ZLSK68fQjmBW?domain=162.255.37.11 (US West)\n• https://url.au.m.mimecastprotect.com/s/_MtyCr839VuP38UytsGB?domain=162.255.36.11 (US East)\n• https://url.au.m.mimecastprotect.com/s/rnVYCvl3ZLup07uoRroC?domain=221.122.88.195 (China)\n• https://url.au.m.mimecastprotect.com/s/lYApCwV3r7cJZGc8WRUd?domain=115.114.131.7 (India Mumbai)\n• https://url.au.m.mimecastprotect.com/s/wbDJCxn31LInq1s2obq7?domain=115.114.115.7 (India Hyderabad)\n• https://url.au.m.mimecastprotect.com/s/2XhPCyo3X2IqmrCyfean?domain=213.19.144.110 (Amsterdam Netherlands)\n• https://url.au.m.mimecastprotect.com/s/EhDdCzv3XYTQNMCV4v1U?domain=213.244.140.110 (Germany)\n• https://url.au.m.mimecastprotect.com/s/T0J5CANV1KuLJNfXg8KW?domain=103.122.166.55 (Australia Sydney)\n• https://url.au.m.mimecastprotect.com/s/zx2oCBNW69upJ7uPk7oX?domain=103.122.167.55 (Australia Melbourne)\n• https://url.au.m.mimecastprotect.com/s/rs2wCD1g8WuNr5FLPM0t?domain=209.9.211.110 (Hong Kong SAR)\n• https://url.au.m.mimecastprotect.com/s/PzanCE8jxWuVo3fLmw7v?domain=149.137.40.110 (Singapore)\n• https://url.au.m.mimecastprotect.com/s/b26uCGvl8WTKZ1fLpDHd?domain=64.211.144.160 (Brazil)\n• https://url.au.m.mimecastprotect.com/s/kUxeCJyoQWI3LqiWJ2HS?domain=69.174.57.160 (Canada Toronto)\n• https://url.au.m.mimecastprotect.com/s/owqJCK1pQ9uzx2uVh53u?domain=65.39.152.160 (Canada Vancouver)\n• https://url.au.m.mimecastprotect.com/s/gsgECL7qJWSyMRtyMSnT?domain=207.226.132.110 (Japan Tokyo)\n• https://url.au.m.mimecastprotect.com/s/NFuBCMwr1WuMVqUAR88h?domain=149.137.24.110 (Japan Osaka)\n\nMeeting ID: 940 3126 5624\n\nThanks\nRanjith Kumar RS\n",
                "location": "https://url.au.m.mimecastprotect.com/s/jsXDCoV5yXcjprU10bfl?domain=breville.zoom.us",
                "creator": {
                    "email": "vtaslim@solutiondigital.biz",
                    "self": true
                },
                "organizer": {
                    "email": "ranjithkumar.rs@breville.com",
                    "displayName": "Ranjithkumar RS"
                },
                "start": {
                    "dateTime": "2024-03-18T12:30:00+11:00",
                    "timeZone": "Asia/Kolkata"
                },
                "end": {
                    "dateTime": "2024-03-18T13:00:00+11:00",
                    "timeZone": "Asia/Kolkata"
                },
                "iCalUID": "040000008200E00074C5B7101A82E00800000000A003DAA7D776DA010000000000000000100000001C883A7F123ACE44BA7395B305AE8BF5",
                "sequence": 0,
                "attendees": [
                    {
                        "email": "alex.mcknight@breville.com.au",
                        "displayName": "Alex McKnight",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "andrew.sirotnik@breville.com",
                        "displayName": "Andrew Sirotnik",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "james.thurgood@breville.com",
                        "displayName": "James Thurgood",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "jmu@vervio.com.au",
                        "displayName": "Josh Mu",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "julian.garcia@breville.com",
                        "displayName": "Julian Garcia",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "kevin.bauer@breville.com",
                        "displayName": "Kevin Bauer",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "louise.patniotis@breville.com",
                        "displayName": "Louise Patniotis",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "maxine.williams@breville.com",
                        "displayName": "Maxine Williams",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "meenatchi.ramalingam@breville.com",
                        "displayName": "Meenatchi Ramalingam",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "michelle.grasso@breville.com.au",
                        "displayName": "Michelle Grasso",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "otto.romer@breville.com",
                        "displayName": "Otto Romer",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "peter.taueki@sageappliances.com",
                        "displayName": "Peter Taueki",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "pradeep.mc@breville.com",
                        "displayName": "Pradeep MC",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ranjithkumar.rs@breville.com",
                        "displayName": "Ranjithkumar RS",
                        "organizer": true,
                        "responseStatus": "accepted"
                    },
                    {
                        "email": "shaari.ward@brevilleusa.com",
                        "displayName": "Shaari Ward",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "shyam.rajsampath@breville.com.au",
                        "displayName": "Shyam RajSampath",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vinit.kumar@breville.com",
                        "displayName": "Vinit Kumar",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vtaslim@solutiondigital.biz",
                        "self": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "yureev.jogessar@breville.com",
                        "displayName": "Yureev Jogessar",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "chloe.broadbent@breville.com",
                        "displayName": "Chloe Broadbent",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ekta.bhardwaj@breville.com",
                        "displayName": "Ekta Bhardwaj",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "joanne.chen@breville.com",
                        "displayName": "Joanne Chen",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "kim.hamlet@breville.com",
                        "displayName": "Kim Hamlet",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "matthew.foust@breville.com",
                        "displayName": "Matthew Foust",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "rishab.shrestha@breville.com",
                        "displayName": "Rishab Shrestha",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ritesh.kant@breville.com",
                        "displayName": "Ritesh Kant",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "rithika.kalidass@breville.com",
                        "displayName": "Rithika Kalidass",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vikramsingh.chauhan@breville.com",
                        "displayName": "Vikramsingh Chauhan",
                        "optional": true,
                        "responseStatus": "needsAction"
                    }
                ],
                "guestsCanInviteOthers": false,
                "privateCopy": true,
                "reminders": {
                    "useDefault": true
                },
                "eventType": "default"
            },
            {
                "kind": "calendar#event",
                "etag": "\"3396580272672000\"",
                "id": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g8l0j2h9n6kqjch1o6spk8e9g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g711j4d1p6l13acpp6t0kac9k6h0k4e1g74q4cc9g84rkcchh8cp0_20240318T030000Z",
                "status": "confirmed",
                "htmlLink": "https://www.google.com/calendar/event?eid=XzYwcTMwYzFnNjBvMzBlMWk2MG80YWMxZzYwcmo4Z3BsODhyajJjMWg4NHMzNGg5ZzYwczMwYzFnNjBvMzBjMWc4bDBqMmg5bjZrcWpjaDFvNnNwazhlOWc2NG8zMGMxZzYwbzMwYzFnNjBvMzBjMWc2MG8zMmMxZzYwbzMwYzFnNzExajRkMXA2bDEzYWNwcDZ0MGthYzlrNmgwazRlMWc3NHE0Y2M5Zzg0cmtjY2hoOGNwMF8yMDI0MDMxOFQwMzAwMDBaIHZ0YXNsaW1Ac29sdXRpb25kaWdpdGFsLmJpeg&ctz=Australia/Sydney",
                "created": "2023-10-26T03:15:26.000Z",
                "updated": "2023-10-26T03:15:36.336Z",
                "summary": "BFF Sync",
                "description": "\n\n\n\nRishab Shrestha is inviting you to a scheduled Zoom meeting.\n\nJoin Zoom Meeting\nhttps://breville.zoom.us/j/98677634416?from=addon\n\nMeeting ID: 986 7763 4416\nOne tap mobile\n+61871501149,,98677634416# Australia\n+61280156011,,98677634416# Australia\n\nDial by your location\n+61 8 7150 1149 Australia\n+61 2 8015 6011 Australia\n+61 3 7018 2005 Australia\n+61 7 3185 3730 Australia\n+61 8 6119 3900 Australia\n+1 309 205 3325 US\n+1 312 626 6799 US (Chicago)\n+1 301 715 8592 US (Washington DC)\n+1 305 224 1968 US\n+1 646 931 3860 US\n+1 929 205 6099 US (New York)\n+1 346 248 7799 US (Houston)\n+1 360 209 5623 US\n+1 386 347 5053 US\n+1 507 473 4847 US\n+1 564 217 2000 US\n+1 669 444 9171 US\n+1 669 900 6833 US (San Jose)\n+1 689 278 1000 US\n+1 719 359 4580 US\n+1 253 205 0468 US\n+1 253 215 8782 US (Tacoma)\n+1 647 374 4685 Canada\n+1 647 558 0588 Canada\n+1 778 907 2071 Canada\n+1 780 666 0144 Canada\n+1 204 272 7920 Canada\n+1 438 809 7799 Canada\n+1 587 328 1099 Canada\n855 703 8985 Canada Toll-free\n+44 203 901 7895 United Kingdom\n+44 208 080 6591 United Kingdom\n+44 208 080 6592 United Kingdom\n+44 330 088 5830 United Kingdom\n+44 131 460 1196 United Kingdom\n+44 203 481 5237 United Kingdom\n+44 203 481 5240 United Kingdom\n+49 69 5050 0951 Germany\n+49 69 5050 0952 Germany\n+49 695 050 2596 Germany\n+49 69 7104 9922 Germany\n+49 69 3807 9883 Germany\n+49 69 3807 9884 Germany\n+852 3008 3297 Hong Kong SAR\n+852 3012 6283 Hong Kong SAR\n+852 5803 3730 Hong Kong SAR\n+852 5803 3731 Hong Kong SAR\n+852 5808 6088 Hong Kong SAR\n400 616 8835 China Toll-free\n400 669 9381 China Toll-free\n+64 9 884 6780 New Zealand\n+64 3 659 0603 New Zealand\n+64 4 886 0026 New Zealand\n+91 80 71 279 440 India\n+91 22 48 798 004 India\n+91 22 71 279 525 India\n+420 5 3889 0161 Czech Republic\n+420 2 2888 2388 Czech Republic\n+420 2 3901 8272 Czech Republic\n+52 558 659 6002 Mexico\n+52 554 161 4288 Mexico\n+52 554 169 6926 Mexico\n+52 556 826 9800 Mexico\n+52 558 659 6001 Mexico\n+39 069 480 6488 Italy\n+39 020 066 7245 Italy\n+39 021 241 28 823 Italy\n800 088 202 Italy Toll-free\n800 790 654 Italy Toll-free\n+82 2 3143 9611 Korea, Republic of\n+82 2 3143 9612 Korea, Republic of\n00 308 321 0267 Korea, Republic of Toll-free\nMeeting ID: 986 7763 4416\nFind your local number: https://breville.zoom.us/u/abTNhCNoUB\n\nJoin by SIP\n98677634416@zoomcrc.com\n\nJoin by H.323\n162.255.37.11 (US West)\n162.255.36.11 (US East)\n221.122.88.195 (China)\n115.114.131.7 (India Mumbai)\n115.114.115.7 (India Hyderabad)\n213.19.144.110 (Amsterdam Netherlands)\n213.244.140.110 (Germany)\n103.122.166.55 (Australia Sydney)\n103.122.167.55 (Australia Melbourne)\n209.9.211.110 (Hong Kong SAR)\n149.137.40.110 (Singapore)\n64.211.144.160 (Brazil)\n69.174.57.160 (Canada Toronto)\n65.39.152.160 (Canada Vancouver)\n207.226.132.110 (Japan Tokyo)\n149.137.24.110 (Japan Osaka)\nMeeting ID: 986 7763 4416\n\nJoin by Skype for Business\nhttps://breville.zoom.us/skype/98677634416\n\n\n________________________________________________________________________________\nMicrosoft Teams meeting\nJoin on your computer, mobile app or room device\nClick here to join the meeting<https://teams.microsoft.com/l/meetup-join/19%3ameeting_YzNkOTRmMjktNzEzMC00MDk4LWIyMmItNDNkODE4ODIwNDEz%40thread.v2/0?context=%7b%22Tid%22%3a%223bc317b4-2fb3-45e8-9410-9824eeb72e16%22%2c%22Oid%22%3a%22ebd57512-bcb1-44f9-aa23-9ece3fe895c5%22%7d>\nMeeting ID: 421 216 602 896\nPasscode: sBaKXM\nDownload Teams<https://www.microsoft.com/en-us/microsoft-teams/download-app> | Join on the web<https://www.microsoft.com/microsoft-teams/join-a-meeting>\nOr call in (audio only)\n+1 213-267-4046,,191605571#<tel:+12132674046,,191605571#>   United States, Los Angeles\nPhone Conference ID: 191 605 571#\nFind a local number<https://dialin.teams.microsoft.com/a909d1d9-28ef-4f4c-b0f3-1a7649aced8a?id=191605571> | Reset PIN<https://dialin.teams.microsoft.com/usp/pstnconferencing>\nLearn More<https://aka.ms/JoinTeamsMeeting> | Meeting options<https://teams.microsoft.com/meetingOptions/?organizerId=ebd57512-bcb1-44f9-aa23-9ece3fe895c5&tenantId=3bc317b4-2fb3-45e8-9410-9824eeb72e16&threadId=19_meeting_YzNkOTRmMjktNzEzMC00MDk4LWIyMmItNDNkODE4ODIwNDEz@thread.v2&messageId=0&language=en-US>\n________________________________________________________________________________\n",
                "location": "https://breville.zoom.us/j/98677634416?from=addon",
                "creator": {
                    "email": "vtaslim@solutiondigital.biz",
                    "self": true
                },
                "organizer": {
                    "email": "rishab.shrestha@breville.com",
                    "displayName": "Rishab Shrestha"
                },
                "start": {
                    "dateTime": "2024-03-18T14:00:00+11:00",
                    "timeZone": "America/Chicago"
                },
                "end": {
                    "dateTime": "2024-03-18T14:30:00+11:00",
                    "timeZone": "America/Chicago"
                },
                "recurringEventId": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g8l0j2h9n6kqjch1o6spk8e9g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g711j4d1p6l13acpp6t0kac9k6h0k4e1g74q4cc9g84rkcchh8cp0",
                "originalStartTime": {
                    "dateTime": "2024-03-18T14:00:00+11:00",
                    "timeZone": "America/Chicago"
                },
                "iCalUID": "040000008200E00074C5B7101A82E00800000000EA1E7556D873D9010000000000000000100000008C2495B5397AE144AB8094F10A7F21C2",
                "sequence": 4,
                "attendees": [
                    {
                        "email": "jmu@solutiondigital.biz",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "manjunatha.rajanna@breville.com",
                        "displayName": "Manjunatha Rajanna",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "santhosh.kumar@breville.com",
                        "displayName": "Santhosh Kumar",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vinit.kumar@breville.com",
                        "displayName": "Vinit Kumar",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "viren.patani@breville.com",
                        "displayName": "Viren Patani",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vtaslim@solutiondigital.biz",
                        "self": true,
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "btran@vervio.com.au",
                        "displayName": "Billy Tran",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "abhijit.r@breville.com",
                        "displayName": "Abhijit R",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "anil.chauhan@breville.com",
                        "displayName": "Anil Kumar Chauhan",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "buvanesh.kumar@breville.com",
                        "displayName": "Buvanesh Kumar Kulanthaivel",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "easwar.saminathan@breville.com",
                        "displayName": "Easwar Saminathan",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "muhammed.azharudheen@breville.com.au",
                        "displayName": "Muhammed Azharudheen",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ritesh.kant@breville.com",
                        "displayName": "Ritesh Kant",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vikramsingh.chauhan@breville.com",
                        "displayName": "Vikramsingh Chauhan",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "rishab.shrestha@breville.com",
                        "displayName": "Rishab Shrestha",
                        "organizer": true,
                        "responseStatus": "accepted"
                    }
                ],
                "guestsCanInviteOthers": false,
                "privateCopy": true,
                "reminders": {
                    "useDefault": true
                },
                "eventType": "default"
            },
            {
                "kind": "calendar#event",
                "etag": "\"3420437994556000\"",
                "id": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g8kp3ggi48d338ci26l2k8g9g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g8kqk2e1j68r3eca28grj4e1k6l0j0ga48opj8g9l74rkac9k8gq0_20240318T050000Z",
                "status": "confirmed",
                "htmlLink": "https://www.google.com/calendar/event?eid=XzYwcTMwYzFnNjBvMzBlMWk2MG80YWMxZzYwcmo4Z3BsODhyajJjMWg4NHMzNGg5ZzYwczMwYzFnNjBvMzBjMWc4a3AzZ2dpNDhkMzM4Y2kyNmwyazhnOWc2NG8zMGMxZzYwbzMwYzFnNjBvMzBjMWc2MG8zMmMxZzYwbzMwYzFnOGtxazJlMWo2OHIzZWNhMjhncmo0ZTFrNmwwajBnYTQ4b3BqOGc5bDc0cmthYzlrOGdxMF8yMDI0MDMxOFQwNTAwMDBaIHZ0YXNsaW1Ac29sdXRpb25kaWdpdGFsLmJpeg&ctz=Australia/Sydney",
                "created": "2024-03-12T04:49:15.000Z",
                "updated": "2024-03-12T04:49:57.278Z",
                "summary": "The Oracles - Daily Scrum",
                "description": "Conversation: We focus on the sprint goal, and each team member to reflect on these 3 questions,\n\n  1.  Do I have any risk to highlight?\n  2.  Do I have something to showcase today and gather feedback?\n  3.  Does anyone need any support from me?\n\n\n\nPrior to the daily scrum, please use the JIRA comment section as your journal to describe what you’ve done. Flag the ticket if you are blocked and tag the person that needs to take any actions.\n\n\n\n\n\nSprint Health Dashboard -  https://url.au.m.mimecastprotect.com/s/Gap2C91KgYuJNZuootCF?domain=breville.atlassian.net\n\nScrum Board - https://url.au.m.mimecastprotect.com/s/9I4WC0YxLDsngEFDHV2A?domain=breville.atlassian.net\n\n James Thurgood is inviting you to a scheduled Zoom meeting.\n\nJoin Zoom Meeting\nhttps://url.au.m.mimecastprotect.com/s/v1BQCgZ32MIvwgs2fToI?domain=breville.zoom.us\n\nMeeting ID: 978 9204 2229\n\n---\n\nOne tap mobile\n+61370182005,,97892042229# Australia\n+61731853730,,97892042229# Australia\n\n---\n\nDial by your location\n• +61 3 7018 2005 Australia\n• +61 7 3185 3730 Australia\n• +61 8 6119 3900 Australia\n• +61 8 7150 1149 Australia\n• +61 2 8015 6011 Australia\n• +1 669 900 6833 US (San Jose)\n• +1 689 278 1000 US\n• +1 719 359 4580 US\n• +1 929 205 6099 US (New York)\n• +1 253 205 0468 US\n• +1 253 215 8782 US (Tacoma)\n• +1 301 715 8592 US (Washington DC)\n• +1 305 224 1968 US\n• +1 309 205 3325 US\n• +1 312 626 6799 US (Chicago)\n• +1 346 248 7799 US (Houston)\n• +1 360 209 5623 US\n• +1 386 347 5053 US\n• +1 507 473 4847 US\n• +1 564 217 2000 US\n• +1 646 931 3860 US\n• +1 669 444 9171 US\n• +1 778 907 2071 Canada\n• +1 780 666 0144 Canada\n• +1 204 272 7920 Canada\n• +1 438 809 7799 Canada\n• +1 587 328 1099 Canada\n• +1 647 374 4685 Canada\n• +1 647 558 0588 Canada\n• 855 703 8985 Canada Toll-free\n• +44 208 080 6592 United Kingdom\n• +44 330 088 5830 United Kingdom\n• +44 131 460 1196 United Kingdom\n• +44 203 481 5237 United Kingdom\n• +44 203 481 5240 United Kingdom\n• +44 203 901 7895 United Kingdom\n• +44 208 080 6591 United Kingdom\n• +49 69 5050 0952 Germany\n• +49 695 050 2596 Germany\n• +49 69 7104 9922 Germany\n• +49 69 3807 9883 Germany\n• +49 69 3807 9884 Germany\n• +49 69 5050 0951 Germany\n• +852 5803 3730 Hong Kong SAR\n• +852 5803 3731 Hong Kong SAR\n• +852 5808 6088 Hong Kong SAR\n• +852 3008 3297 Hong Kong SAR\n• +852 3012 6283 Hong Kong SAR\n• 400 669 9381 China Toll-free\n• 400 616 8835 China Toll-free\n• +64 3 659 0603 New Zealand\n• +64 4 886 0026 New Zealand\n• +64 9 884 6780 New Zealand\n• +91 22 48 798 004 India\n• +91 22 71 279 525 India\n• +91 80 71 279 440 India\n• +420 2 2888 2388 Czech Republic\n• +420 2 3901 8272 Czech Republic\n• +420 5 3889 0161 Czech Republic\n• +52 554 169 6926 Mexico\n• +52 556 826 9800 Mexico\n• +52 558 659 6001 Mexico\n• +52 558 659 6002 Mexico\n• +52 554 161 4288 Mexico\n• +39 020 066 7245 Italy\n• +39 021 241 28 823 Italy\n• +39 069 480 6488 Italy\n• 800 790 654 Italy Toll-free\n• 800 088 202 Italy Toll-free\n• +82 2 3143 9612 Korea, Republic of\n• +82 2 3143 9611 Korea, Republic of\n• 00 308 321 0267 Korea, Republic of Toll-free\n\nMeeting ID: 978 9204 2229\n\nFind your local number: https://url.au.m.mimecastprotect.com/s/5dTLCjZ386IzG6s70I-7?domain=breville.zoom.us\n\n---\n\nJoin by SIP\n• 97892042229@zoomcrc.com\n\n---\n\nJoin by H.323\n• https://url.au.m.mimecastprotect.com/s/QjrjCk837XuDXLiJ8b_4?domain=162.255.37.11 (US West)\n• https://url.au.m.mimecastprotect.com/s/92-pClx37EFWP9iYdeoJ?domain=162.255.36.11 (US East)\n• https://url.au.m.mimecastprotect.com/s/s2SzCmO3yNiVP0tN_uhg?domain=221.122.88.195 (China)\n• https://url.au.m.mimecastprotect.com/s/sxUECnx3O6F43yt0MRJE?domain=115.114.131.7 (India Mumbai)\n• https://url.au.m.mimecastprotect.com/s/EU1ECoV5yXcAPoi2JPuc?domain=115.114.115.7 (India Hyderabad)\n• https://url.au.m.mimecastprotect.com/s/x3VYCp832LugOltv3QND?domain=213.19.144.110 (Amsterdam Netherlands)\n• https://url.au.m.mimecastprotect.com/s/S0G1Cq73ZLSgk4tY9QvO?domain=213.244.140.110 (Germany)\n• https://url.au.m.mimecastprotect.com/s/TfCYCr839VuynNU66tju?domain=103.122.166.55 (Australia Sydney)\n• https://url.au.m.mimecastprotect.com/s/X29tCvl3ZLuJLBuY-jET?domain=103.122.167.55 (Australia Melbourne)\n• https://url.au.m.mimecastprotect.com/s/ljkwCwV3r7c5VOS3qJCu?domain=209.9.211.110 (Hong Kong SAR)\n• https://url.au.m.mimecastprotect.com/s/5_R2Cxn31LIpRGFXLSrz?domain=149.137.40.110 (Singapore)\n• https://url.au.m.mimecastprotect.com/s/PgrvCyo3X2IG2jCz_a_t?domain=64.211.144.160 (Brazil)\n• https://url.au.m.mimecastprotect.com/s/NSC3Czv3XYTXwPf2FEmE?domain=69.174.57.160 (Canada Toronto)\n• https://url.au.m.mimecastprotect.com/s/z9juCANV1KuxlmSR1G3J?domain=65.39.152.160 (Canada Vancouver)\n• https://url.au.m.mimecastprotect.com/s/RJMxCBNW69uxRZSgAb4V?domain=207.226.132.110 (Japan Tokyo)\n• https://url.au.m.mimecastprotect.com/s/i1wcCD1g8Wu7J6S9ynvQ?domain=149.137.24.110 (Japan Osaka)\n\nMeeting ID: 978 9204 2229\n\n",
                "location": "https://url.au.m.mimecastprotect.com/s/v1BQCgZ32MIvwgs2fToI?domain=breville.zoom.us",
                "creator": {
                    "email": "vtaslim@solutiondigital.biz",
                    "self": true
                },
                "organizer": {
                    "email": "james.thurgood@breville.com",
                    "displayName": "James Thurgood"
                },
                "start": {
                    "dateTime": "2024-03-18T16:00:00+11:00",
                    "timeZone": "Australia/Sydney"
                },
                "end": {
                    "dateTime": "2024-03-18T16:25:00+11:00",
                    "timeZone": "Australia/Sydney"
                },
                "recurringEventId": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g8kp3ggi48d338ci26l2k8g9g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g8kqk2e1j68r3eca28grj4e1k6l0j0ga48opj8g9l74rkac9k8gq0",
                "originalStartTime": {
                    "dateTime": "2024-03-18T16:00:00+11:00",
                    "timeZone": "Australia/Sydney"
                },
                "iCalUID": "040000008200E00074C5B7101A82E00800000000E28BDCF42B5EDA01000000000000000010000000E5A832671BD72845A0ADF34A597E14D4",
                "sequence": 2,
                "attendees": [
                    {
                        "email": "bella.lindsay@breville.com",
                        "displayName": "Bella Lindsay",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "cameron.flint@breville.com",
                        "displayName": "Cameron Flint",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "james.thurgood@breville.com",
                        "displayName": "James Thurgood",
                        "organizer": true,
                        "responseStatus": "accepted"
                    },
                    {
                        "email": "jmu@solutiondigital.biz",
                        "displayName": "Cc: Josh Mu",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "meenatchi.ramalingam@breville.com",
                        "displayName": "Meenatchi Ramalingam",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "pradeep.mc@breville.com",
                        "displayName": "Pradeep MC",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ranjithkumar.rs@breville.com",
                        "displayName": "Ranjithkumar RS",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "rocky.huang@breville.com",
                        "displayName": "Rocky Huang",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "sebastian.filler@breville.com",
                        "displayName": "Sebastian Filler",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vinit.kumar@breville.com",
                        "displayName": "Vinit Kumar",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vtaslim@solutiondigital.biz",
                        "self": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "yureev.jogessar@breville.com",
                        "displayName": "Yureev Jogessar",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ekta.bhardwaj@breville.com",
                        "displayName": "Ekta Bhardwaj",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "harshada_desai@persistent.com",
                        "displayName": "Harshada Desai",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "jayakumar.manickam@breville.com",
                        "displayName": "Jayakumar Manickam",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ritesh.kant@breville.com",
                        "displayName": "Ritesh Kant",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "rodrigo.costa@breville.com",
                        "displayName": "Rodrigo Costa",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "umashankar_konatham@persistent.com",
                        "displayName": "Umashankar Konatham",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vikramsingh.chauhan@breville.com",
                        "displayName": "Vikramsingh Chauhan",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "renukeshwar.chinta@breville.com",
                        "displayName": "Renukeshwar Chinta",
                        "optional": true,
                        "responseStatus": "needsAction"
                    }
                ],
                "guestsCanInviteOthers": false,
                "privateCopy": true,
                "reminders": {
                    "useDefault": true
                },
                "eventType": "default"
            },
            {
                "kind": "calendar#event",
                "etag": "\"3419442052024000\"",
                "id": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g74o44h1l8gskah246p348g9g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g60o4adi26cs48e1j6t2j4dhk71146ea18gpj4c9l8cp4ae9m8p1g_20240318T053000Z",
                "status": "confirmed",
                "htmlLink": "https://www.google.com/calendar/event?eid=XzYwcTMwYzFnNjBvMzBlMWk2MG80YWMxZzYwcmo4Z3BsODhyajJjMWg4NHMzNGg5ZzYwczMwYzFnNjBvMzBjMWc3NG80NGgxbDhnc2thaDI0NnAzNDhnOWc2NG8zMGMxZzYwbzMwYzFnNjBvMzBjMWc2MG8zMmMxZzYwbzMwYzFnNjBvNGFkaTI2Y3M0OGUxajZ0Mmo0ZGhrNzExNDZlYTE4Z3BqNGM5bDhjcDRhZTltOHAxZ18yMDI0MDMxOFQwNTMwMDBaIHZ0YXNsaW1Ac29sdXRpb25kaWdpdGFsLmJpeg&ctz=Australia/Sydney",
                "created": "2024-03-06T10:29:23.000Z",
                "updated": "2024-03-06T10:30:26.012Z",
                "summary": "KT Session on CT/Middleware/Avalara",
                "description": "Hi @Renukeshwar Chinta<mailto:Renukeshwar.Chinta@breville.com> @Ritesh Kant<mailto:Ritesh.Kant@breville.com>/All,\n\nKT sessions are scheduled from 7th March until 22nd march for below topics. Thanks\nLets start at 11 am IST to 12pm IST tomorrow, and if everyone prefer agreed different time, then we can update the calendar.\n\n\nTopics\nSub Topics\nOwner\nDuration in Hrs\nDate\nData Alchemy\nRecipe Details GraphQL API\nRitesh\n1\n07-Mar-24\nRecipe Slugs API\nVikram\n1\n08-Mar-24\nWeb-Orchestration\nComplete framework\nRitesh\n1\n11-Mar-24\nCart handling - Get cart, Update cart etc\nRitesh\nPayment methods handling - Mulitple payments etc\nRitesh\n1\n12-Mar-24\nPayment Error handling\nRitesh\nRate limiting for discount code\nRitesh\n1\n13-Mar-24\nGet Cart Issues\nRitesh\nOptimizations done\nRitesh\nOrder capture, Recurring order\n\nRitesh\n1\n14-Mar-24\nGift card handling\n\nRitesh/Easwar\n1\n18-Mar-24\nAnalysis of spike in orphan transaction\n\nRitesh\n1\n21-Mar-24\nAvalara Tax calculation service\nOrder Reconciliation support\n\nAnil/Sudhakar\n1\n22-Mar-24\n\n\n\n\nThanks\nPradeep\n\n Pradeep MC is inviting you to a scheduled Zoom meeting.\n\nJoin Zoom Meeting\nhttps://url.au.m.mimecastprotect.com/s/CgmQCP7xQWS13yhz2RB9?domain=breville.zoom.us\n\nMeeting ID: 920 9148 9803\n\n---\n\nOne tap mobile\n+61731853730,,92091489803# Australia\n+61861193900,,92091489803# Australia\n\n---\n\nDial by your location\n• +61 7 3185 3730 Australia\n• +61 8 6119 3900 Australia\n• +61 8 7150 1149 Australia\n• +61 2 8015 6011 Australia\n• +61 3 7018 2005 Australia\n• +1 253 205 0468 US\n• +1 253 215 8782 US (Tacoma)\n• +1 301 715 8592 US (Washington DC)\n• +1 305 224 1968 US\n• +1 309 205 3325 US\n• +1 312 626 6799 US (Chicago)\n• +1 346 248 7799 US (Houston)\n• +1 360 209 5623 US\n• +1 386 347 5053 US\n• +1 507 473 4847 US\n• +1 564 217 2000 US\n• +1 646 931 3860 US\n• +1 669 444 9171 US\n• +1 669 900 6833 US (San Jose)\n• +1 689 278 1000 US\n• +1 719 359 4580 US\n• +1 929 205 6099 US (New York)\n• +1 587 328 1099 Canada\n• +1 647 374 4685 Canada\n• +1 647 558 0588 Canada\n• +1 778 907 2071 Canada\n• +1 780 666 0144 Canada\n• +1 204 272 7920 Canada\n• +1 438 809 7799 Canada\n• 855 703 8985 Canada Toll-free\n• +44 203 481 5240 United Kingdom\n• +44 203 901 7895 United Kingdom\n• +44 208 080 6591 United Kingdom\n• +44 208 080 6592 United Kingdom\n• +44 330 088 5830 United Kingdom\n• +44 131 460 1196 United Kingdom\n• +44 203 481 5237 United Kingdom\n• +49 69 3807 9884 Germany\n• +49 69 5050 0951 Germany\n• +49 69 5050 0952 Germany\n• +49 695 050 2596 Germany\n• +49 69 7104 9922 Germany\n• +49 69 3807 9883 Germany\n• +852 5803 3731 Hong Kong SAR\n• +852 5808 6088 Hong Kong SAR\n• +852 3008 3297 Hong Kong SAR\n• +852 3012 6283 Hong Kong SAR\n• +852 5803 3730 Hong Kong SAR\n• 400 669 9381 China Toll-free\n• 400 616 8835 China Toll-free\n• +64 4 886 0026 New Zealand\n• +64 9 884 6780 New Zealand\n• +64 3 659 0603 New Zealand\n• +91 22 71 279 525 India\n• +91 80 71 279 440 India\n• +91 22 48 798 004 India\n• +420 2 3901 8272 Czech Republic\n• +420 5 3889 0161 Czech Republic\n• +420 2 2888 2388 Czech Republic\n• +52 556 826 9800 Mexico\n• +52 558 659 6001 Mexico\n• +52 558 659 6002 Mexico\n• +52 554 161 4288 Mexico\n• +52 554 169 6926 Mexico\n• +39 021 241 28 823 Italy\n• +39 069 480 6488 Italy\n• +39 020 066 7245 Italy\n• 800 790 654 Italy Toll-free\n• 800 088 202 Italy Toll-free\n• +82 2 3143 9612 Korea, Republic of\n• +82 2 3143 9611 Korea, Republic of\n• 00 308 321 0267 Korea, Republic of Toll-free\n\nMeeting ID: 920 9148 9803\n\nFind your local number: https://url.au.m.mimecastprotect.com/s/RIPACQny7gI1ozhPM0Bm?domain=breville.zoom.us\n\n---\n\nJoin by SIP\n• 92091489803@zoomcrc.com<mailto:92091489803@zoomcrc.com>\n\n---\n\nJoin by H.323\n• https://url.au.m.mimecastprotect.com/s/6_GeCROz1jiD57SPcKsN?domain=162.255.37.11 (US West)\n• https://url.au.m.mimecastprotect.com/s/_LHpCVAEQnIngOcJ35Y1?domain=162.255.36.11 (US East)\n• https://url.au.m.mimecastprotect.com/s/hj67CWLGqohLDlUmK7iQ?domain=221.122.88.195 (China)\n• https://url.au.m.mimecastprotect.com/s/QS5TCXLJ5phPOph9_RmQ?domain=115.114.131.7 (India Mumbai)\n• https://url.au.m.mimecastprotect.com/s/ZCO7CYWK5qTWAGh3Jk9T?domain=115.114.115.7 (India Hyderabad)\n• https://url.au.m.mimecastprotect.com/s/my0CCZYL0rsqQOcNPikk?domain=213.19.144.110 (Amsterdam Netherlands)\n• https://url.au.m.mimecastprotect.com/s/KiUMC1Wy43TAqvsm2sIp?domain=213.244.140.110 (Germany)\n• https://url.au.m.mimecastprotect.com/s/_yejC2x0WDF28nIvVL3Y?domain=103.122.166.55 (Australia Sydney)\n• https://url.au.m.mimecastprotect.com/s/bpC3C3QAwVCg2LhjImJV?domain=103.122.167.55 (Australia Melbourne)\n• https://url.au.m.mimecastprotect.com/s/PygDC4QBLGC2lLIzudIV?domain=209.9.211.110 (Hong Kong SAR)\n• https://url.au.m.mimecastprotect.com/s/Bwi3C5QDLKCP6qhAqIjD?domain=149.137.40.110 (Singapore)\n• https://url.au.m.mimecastprotect.com/s/jEC5C6XE9Kh6yQhD_suw?domain=64.211.144.160 (Brazil)\n• https://url.au.m.mimecastprotect.com/s/55MSC71GXVuXZ3F4L7ep?domain=69.174.57.160 (Canada Toronto)\n• https://url.au.m.mimecastprotect.com/s/4VLKC81JEKu5YnsViJIs?domain=65.39.152.160 (Canada Vancouver)\n• https://url.au.m.mimecastprotect.com/s/uA4FC91KgYuW2ohwVwru?domain=207.226.132.110 (Japan Tokyo)\n• https://url.au.m.mimecastprotect.com/s/mSdgC0YxLDsXm6FJbj8P?domain=149.137.24.110 (Japan Osaka)\n\nMeeting ID: 920 9148 9803\n",
                "location": "https://url.au.m.mimecastprotect.com/s/CgmQCP7xQWS13yhz2RB9?domain=breville.zoom.us",
                "creator": {
                    "email": "vtaslim@solutiondigital.biz",
                    "self": true
                },
                "organizer": {
                    "email": "pradeep.mc@breville.com",
                    "displayName": "Pradeep MC"
                },
                "start": {
                    "dateTime": "2024-03-18T16:30:00+11:00",
                    "timeZone": "Asia/Kolkata"
                },
                "end": {
                    "dateTime": "2024-03-18T17:30:00+11:00",
                    "timeZone": "Asia/Kolkata"
                },
                "recurringEventId": "_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g74o44h1l8gskah246p348g9g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g60o4adi26cs48e1j6t2j4dhk71146ea18gpj4c9l8cp4ae9m8p1g",
                "originalStartTime": {
                    "dateTime": "2024-03-18T16:30:00+11:00",
                    "timeZone": "Asia/Kolkata"
                },
                "iCalUID": "040000008200E00074C5B7101A82E0080000000090BD5D9EDD6FDA0100000000000000001000000000E6B38D837E2648BC9AD3215C2E96FC",
                "sequence": 0,
                "attendees": [
                    {
                        "email": "jmu@vervio.com.au",
                        "displayName": "Josh Mu",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "manjunatha.rajanna@breville.com",
                        "displayName": "Manjunatha Rajanna",
                        "optional": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "pradeep.mc@breville.com",
                        "displayName": "Pradeep MC",
                        "organizer": true,
                        "responseStatus": "accepted"
                    },
                    {
                        "email": "ranjithkumar.rs@breville.com",
                        "displayName": "Ranjithkumar RS",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vinit.kumar@breville.com",
                        "displayName": "Vinit Kumar",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vtaslim@solutiondigital.biz",
                        "self": true,
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "anil.chauhan@breville.com",
                        "displayName": "Anil Kumar Chauhan",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ekta.bhardwaj@breville.com",
                        "displayName": "Ekta Bhardwaj",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "jayakumar.manickam@breville.com",
                        "displayName": "Jayakumar Manickam",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "muhammed.azharudheen@breville.com.au",
                        "displayName": "Muhammed Azharudheen",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "renukeshwar.chinta@breville.com",
                        "displayName": "Renukeshwar Chinta",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "ritesh.kant@breville.com",
                        "displayName": "Ritesh Kant",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "sudhakar.sherigar@breville.com",
                        "displayName": "Sudhakar Sherigar",
                        "responseStatus": "needsAction"
                    },
                    {
                        "email": "vikramsingh.chauhan@breville.com",
                        "displayName": "Vikramsingh Chauhan",
                        "responseStatus": "needsAction"
                    }
                ],
                "guestsCanInviteOthers": false,
                "privateCopy": true,
                "reminders": {
                    "useDefault": true
                },
                "eventType": "default"
            }
        ]
    },
    "headers": {
        "alt-svc": "h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000",
        "cache-control": "private, max-age=0, must-revalidate, no-transform",
        "connection": "close",
        "content-encoding": "gzip",
        "content-type": "application/json; charset=UTF-8",
        "date": "Sun, 17 Mar 2024 11:19:53 GMT",
        "expires": "Sun, 17 Mar 2024 11:19:53 GMT",
        "server": "ESF",
        "transfer-encoding": "chunked",
        "vary": "Origin, X-Origin, Referer",
        "x-content-type-options": "nosniff",
        "x-frame-options": "SAMEORIGIN",
        "x-xss-protection": "0"
    },
    "status": 200,
    "statusText": "OK",
    "request": {
        "responseURL": "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2024-03-17T13%3A00%3A00.000Z&timeMax=2024-03-18T12%3A59%3A00.000Z&maxResults=5&singleEvents=true&orderBy=startTime&timeZone=Australia%2FSydney"
    }
}