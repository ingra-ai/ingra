# Google API Scopes Explanation

This application requires certain permissions to Google services to manage your daily tasks effectively. Below is a detailed explanation of each scope and its purpose.

## Basic Profile Information

- `https://www.googleapis.com/auth/userinfo.email`: Access your email address to identify your Google account.
- `https://www.googleapis.com/auth/userinfo.profile`: Access your basic profile information, such as your name and picture.

## Google Calendar

- `https://www.googleapis.com/auth/calendar`: Full access to your Google Calendar, allowing the app to manage events and settings.

## Google Contacts

- `https://www.googleapis.com/auth/contacts`: Full access to your Google Contacts, enabling the app to view and manage your contacts.

## Gmail

- `https://www.googleapis.com/auth/gmail.modify`: Full access to modify your Gmail messages and settings, allowing the app to view and send emails, manage drafts, and more.
- `https://www.googleapis.com/auth/gmail.readonly`: View your emails and basic settings. (Optional scope for read-only access)
- `https://www.googleapis.com/auth/gmail.send`: Send emails on your behalf. (Optional scope for sending emails)
- `https://www.googleapis.com/auth/gmail.settings.basic`: Manage your basic mail settings. (Optional scope for managing basic settings)
- `https://www.googleapis.com/auth/gmail.settings.sharing`: Manage your sensitive mail settings, including forwarding rules and aliases. (Optional scope for managing sensitive settings)

## Google Drive

- `https://www.googleapis.com/auth/drive`: Full access to Google Drive, to view, edit, organize, and delete all your drive files.
- `https://www.googleapis.com/auth/drive.file`: View and manage Google Drive files and folders that you have opened or created with this app. (Optional scope for app-specific file access)
- `https://www.googleapis.com/auth/drive.readonly`: View Google Drive files and folders that are shared with you. (Optional scope for read-only access)

## Google Sheets

- `https://www.googleapis.com/auth/spreadsheets`: Full access to Google Sheets, allowing the app to view and manage your sheets.
- `https://www.googleapis.com/auth/spreadsheets.readonly`: Read-only access to your Google Sheets. (Optional scope for read-only access)

## People API

- `https://www.googleapis.com/auth/contacts`: Access to view and manage the contacts in your Google Account, using the People API.
- `https://www.googleapis.com/auth/contacts.readonly`: Access to view your contacts and their photos. (Optional scope for read-only access)

These permissions are essential for the application to function correctly and provide you with a seamless experience across Google services. For more information, please visit the official Google API documentation.
