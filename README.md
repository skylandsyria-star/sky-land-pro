# Sky Land CRM

Create a complete, production-ready Arabic real estate CRM, appointment manager, reminder system, property database, and daily task management application for a small real estate office called “Sky Land”.



The application must be designed primarily for Android mobile devices, with a responsive web dashboard. It should preferably be built as an installable Progressive Web App or as a native Android-compatible application.



The entire user interface must be in Arabic, use a full right-to-left layout, and have a professional, clean, modern real estate design.



The most important requirements are reliable reminders, strong alarm notifications, customer follow-up management, property owner management, buyer and tenant request management, and direct calling and WhatsApp actions.



1. Technical requirements



Build the application with:



- Arabic RTL interface.

- Mobile-first responsive design.

- Installable PWA or Android application.

- Secure authentication.

- Cloud database.

- Cloud image and video storage.

- Offline support for recently viewed data.

- Automatic synchronization when internet access returns.

- Local notifications and push notifications.

- Android exact alarm support when technically available.

- Notifications that can work while the application is closed.

- Strong alarm sound.

- Vibration.

- Full-screen reminder notifications for important appointments.

- Automatic backups.

- Data export to CSV or Excel.

- Secure image uploads.

- Image compression before uploading.

- Fast search and filtering.

- Scalable database architecture.



Do not build this as a simple static website. Build it as a functional data-driven application with a real database, working forms, reminders, search, filtering, relationships between records, and persistent user data.



2. User type



For the first version, create one main administrator account.



The database and code structure should support adding employees and permission levels later.



Possible future roles:



- Administrator.

- Real estate agent.

- Photographer.

- Office employee.

- Read-only employee.



3. Main dashboard



Create an Arabic dashboard showing:



- Today’s appointments.

- Upcoming appointments.

- Overdue appointments.

- Today’s tasks.

- Overdue tasks.

- Customers requiring follow-up.

- Property owners requiring follow-up.

- New property requests.

- Recently added properties.

- Total available properties.

- Total buyer requests.

- Total rental requests.

- Total property owners.

- Total appointments this week.

- Quick action buttons.



Quick action buttons:



- Add appointment.

- Add property owner.

- Add property.

- Add property request.

- Add customer.

- Add daily task.



Use cards, counters, status labels, and clear Arabic icons.



4. Appointment management



Create a complete appointment module.



Each appointment must contain:



- Appointment title.

- Appointment type.

- Customer or property owner.

- Related property.

- Date.

- Start time.

- Optional end time.

- Location.

- Google Maps location link.

- Notes.

- Priority.

- Reminder time.

- Repeat option.

- Appointment status.



Appointment types:



- Property photography.

- Property viewing.

- Client meeting.

- Phone call.

- Contract meeting.

- Payment collection.

- Property inspection.

- General appointment.

- Custom type.



Appointment statuses:



- Upcoming.

- Completed.

- Delayed.

- Cancelled.

- Missed.



Reminder options:



- At the appointment time.

- 5 minutes before.

- 10 minutes before.

- 15 minutes before.

- 30 minutes before.

- 1 hour before.

- 1 day before.

- Custom reminder time.



The application must generate a strong reminder with:



- Alarm sound.

- Vibration.

- Full-screen notification when supported.

- Appointment title.

- Customer name.

- Appointment time.

- Appointment location.

- Related property.

- Notes summary.



Notification action buttons:



- Call customer.

- Open WhatsApp.

- Open appointment.

- Snooze for 10 minutes.

- Mark as completed.

- Reschedule.



Allow the user to choose the reminder sound and enable or disable vibration.



Create calendar views:



- Daily calendar.

- Weekly calendar.

- Monthly calendar.

- Agenda list.



Use color-coded appointment types.



5. Property owner management



Create a section called “أصحاب العقارات”.



Each property owner profile must contain:



- Full name.

- Main phone number.

- WhatsApp number.

- Secondary phone number.

- City.

- Area.

- Full address.

- General notes.

- Preferred contact method.

- Source of lead.

- Date added.

- Last contact date.

- Next follow-up date.

- Follow-up interval.

- Owner status.

- Profile photo if available.

- List of all properties owned by this person.

- Complete communication and activity history.



Owner statuses:



- New.

- Contacted.

- Active.

- Waiting.

- Not responding.

- Completed.

- Archived.



Provide action buttons:



- Call.

- WhatsApp.

- Copy number.

- Add property.

- Add appointment.

- Add follow-up.

- Add note.

- View activity history.



When the Call button is pressed, open the Android phone dialer with the customer number.



When the WhatsApp button is pressed, open the WhatsApp conversation directly with the saved number.



Support international phone number formatting.



6. Property management



Create a section called “العقارات”.



Each property record must contain:



Basic details



- Property title.

- Property reference number automatically generated.

- Property owner.

- Listing purpose: sale or rent.

- Property type.

- Property status.

- Date added.

- Last update date.

- Assigned employee in future versions.



Property types



- Apartment.

- Villa.

- House.

- Land.

- Commercial shop.

- Office.

- Warehouse.

- Farm.

- Building.

- Chalet.

- Other.



Location



- Governorate.

- City.

- Area.

- Neighborhood.

- Street.

- Nearby landmark.

- Full address.

- Google Maps link.

- Latitude and longitude if available.



Price



- Price.

- Currency.

- Negotiable or fixed.

- Payment method.

- Installment availability.

- Commission amount or percentage.

- Owner’s final acceptable price.

- Public advertised price.

- Private internal price notes.



Property specifications



- Total area.

- Built area.

- Number of bedrooms.

- Number of living rooms.

- Number of bathrooms.

- Number of balconies.

- Floor number.

- Total building floors.

- Elevator.

- Parking.

- Furnished or unfurnished.

- Finishing condition.

- Building age.

- Orientation.

- View.

- Electricity availability.

- Water availability.

- Heating.

- Air conditioning.

- Garden.

- Terrace.

- Roof access.

- Storage room.

- Private entrance.

- Road access.

- Additional specifications.



Legal information



- Ownership type.

- Property deed type.

- Green title deed availability.

- Legal status.

- Property registration notes.

- Private legal notes.



Media



- Multiple property images.

- Cover image.

- Property videos.

- Documents.

- Floor plans.

- Ownership document images when needed.



Allow:



- Camera upload.

- Gallery upload.

- Multiple image selection.

- Image reordering.

- Cover image selection.

- Image deletion.

- Image captions.

- Automatic image compression.



Description



- Public property description.

- Private internal notes.

- Owner instructions.

- Photography notes.

- Marketing notes.



Property statuses



- New.

- Available.

- Under review.

- Photography required.

- Ready for marketing.

- Published.

- Reserved.

- Sold.

- Rented.

- Suspended.

- Archived.



Provide property action buttons:



- Call owner.

- WhatsApp owner.

- Add appointment.

- Add follow-up.

- Edit property.

- Share property.

- Copy property information.

- Find matching customers.

- Mark as sold.

- Mark as rented.

- Archive.



7. Buyer and tenant request management



Create a section called “طلبات العقارات”.



This section stores every customer who is searching for a property.



Each request must include:



Customer details



- Full name.

- Phone number.

- WhatsApp number.

- Secondary phone number.

- City.

- Customer source.

- Notes.



Request details



- Request type: purchase or rent.

- Desired property type.

- Preferred governorate.

- Preferred city.

- Preferred areas.

- Minimum budget.

- Maximum budget.

- Currency.

- Minimum area.

- Maximum area.

- Minimum number of bedrooms.

- Preferred floor.

- Elevator required.

- Parking required.

- Desired finishing condition.

- Furnished or unfurnished.

- Preferred view.

- Payment method.

- Cash or installments.

- Required legal ownership type.

- Additional requirements.

- Request urgency.

- Customer seriousness level.

- Expected purchase date.

- Request creation date.

- Last contact date.

- Next follow-up date.

- Follow-up interval.

- Assigned employee in future versions.



Request statuses:



- New.

- Not contacted.

- Contacted.

- Searching.

- Matching properties found.

- Properties sent.

- Viewing scheduled.

- Negotiating.

- Agreement completed.

- Request paused.

- Request cancelled.

- Closed.

- Archived.



Provide action buttons:



- Call.

- WhatsApp.

- Add follow-up.

- Add appointment.

- Find matching properties.

- Send property.

- Change status.

- Add note.

- Archive.



8. Automatic follow-up reminders



Create an intelligent follow-up system.



When a new property owner or property request is added, allow the user to choose a follow-up period:



- After 1 day.

- After 2 days.

- After 3 days.

- After 7 days.

- Custom date and time.



If the user does not record any follow-up action before the deadline, create a reminder notification.



Example Arabic notification:



“لم تتم متابعة العميل وسام منذ 3 أيام. يبحث عن شقة غرفتي نوم وصالون في طرطوس.”



The reminder must contain:



- Customer name.

- Phone number.

- Request summary.

- Number of days since last contact.

- Last contact result.

- Next required action.



Action buttons:



- Call.

- WhatsApp.

- Record follow-up.

- Snooze.

- Open customer profile.

- Close request.



Create a dashboard section called “بحاجة للمتابعة”.



Sort follow-ups by:



- Overdue first.

- High priority first.

- Oldest contact first.

- Most serious customers first.



Use visual status labels:



- Due today.

- Overdue by one day.

- Overdue by three days.

- Overdue by one week.

- No contact recorded.



9. Follow-up and activity history



Every customer, property owner, request, and property must have an activity timeline.



Activity types:



- Phone call.

- WhatsApp message.

- Office visit.

- Property viewing.

- Property photography.

- Property sent to customer.

- Customer did not answer.

- Owner did not answer.

- Price updated.

- Appointment scheduled.

- Appointment cancelled.

- Negotiation started.

- Agreement completed.

- Note added.

- Status changed.

- Custom activity.



Each activity record must contain:



- Activity type.

- Date.

- Time.

- Employee in future versions.

- Result.

- Notes.

- Next action.

- Next follow-up date.



After pressing the Call button and returning to the application, display a small form asking:



- Did the customer answer?

- What was the result?

- Add a note.

- Set the next follow-up date.



10. Property and customer matching system



Create a matching engine between available properties and customer requests.



When a property is added or updated, automatically compare it with active customer requests.



Matching criteria:



- Sale or rent.

- Property type.

- Governorate.

- City.

- Area.

- Price range.

- Area range.

- Number of bedrooms.

- Elevator requirement.

- Parking requirement.

- Finishing condition.

- Furnished status.

- Payment method.

- Other important preferences.



Display a match percentage from 0% to 100%.



Example:



“يوجد 4 عملاء محتملين لهذا العقار.”



Inside a property profile, create a tab called:



“العملاء المناسبون”



Inside a customer request, create a tab called:



“العقارات المناسبة”



Show the reason for each match, such as:



- Correct location.

- Within budget.

- Correct number of rooms.

- Correct property type.

- Missing elevator requirement.

- Slightly above budget.



Allow the user to manually accept or reject a match.



Allow the user to mark a property as sent to a customer.



Prevent sending the same property to the same customer repeatedly without showing a warning.



11. Daily task management



Create a section called “المهام اليومية”.



Each task must contain:



- Task title.

- Description.

- Related customer.

- Related property owner.

- Related property.

- Related property request.

- Start date.

- Due date.

- Due time.

- Priority.

- Status.

- Reminder.

- Repeat option.

- Notes.



Priorities:



- Low.

- Normal.

- High.

- Urgent.



Statuses:



- New.

- In progress.

- Completed.

- Delayed.

- Cancelled.



Task examples:



- Call property owner.

- Photograph apartment.

- Edit property photos.

- Publish property advertisement.

- Send property options to customer.

- Confirm viewing appointment.

- Collect documents.

- Follow up on price.

- Visit property.

- Prepare contract.



Views:



- Today.

- Tomorrow.

- This week.

- Overdue.

- Completed.

- Calendar view.



12. Search and filters



Create a global search field.



The user must be able to search by:



- Customer name.

- Owner name.

- Phone number.

- WhatsApp number.

- Property reference number.

- Property area.

- Property price.

- Property type.

- Request details.

- Notes.



Create advanced filters for:



- Sale or rent.

- Property type.

- Governorate.

- City.

- Area.

- Price range.

- Area range.

- Number of bedrooms.

- Property status.

- Request status.

- Date added.

- Last follow-up date.

- Follow-up overdue status.

- Customer seriousness.

- Owner status.



Support sorting by:



- Newest.

- Oldest.

- Lowest price.

- Highest price.

- Last contacted.

- Follow-up due date.

- Priority.



13. Direct call and WhatsApp integration



Place clear Call and WhatsApp buttons in every relevant customer, owner, property, request, appointment, and follow-up screen.



Call button behavior:



- Open the phone dialer directly.

- Insert the saved phone number automatically.



WhatsApp button behavior:



- Open the customer’s WhatsApp conversation directly.

- Support WhatsApp and WhatsApp Business.

- Allow selecting a saved message template.



Create Arabic WhatsApp message templates, such as:



- Greeting message.

- Appointment confirmation.

- Property information.

- Viewing reminder.

- Follow-up message.

- Price update.

- Request for property photos.

- Request for ownership details.



Allow the user to edit message templates from Settings.



14. Notifications center



Create a complete notifications center.



Notification categories:



- Appointment reminders.

- Follow-up reminders.

- Task reminders.

- Overdue task alerts.

- New matching property.

- New matching customer.

- Property status reminders.

- Missing property information.

- Scheduled viewing reminders.



Each notification should support:



- Mark as read.

- Mark all as read.

- Snooze.

- Open related record.

- Delete.

- Filter by category.

- Filter by date.



15. Reports and statistics



Create a basic reports section showing:



- Number of new properties.

- Number of new property requests.

- Number of completed calls.

- Number of unanswered calls.

- Number of scheduled appointments.

- Number of completed appointments.

- Number of overdue follow-ups.

- Number of properties sold.

- Number of properties rented.

- Number of active owners.

- Number of active buyers.

- Conversion rate by request status.

- Most requested areas.

- Most requested property types.

- Average customer response time.



Display reports using simple cards and charts.



Allow filtering by:



- Today.

- This week.

- This month.

- Custom date range.



16. Data export and backup



Allow exporting:



- Property owners.

- Properties.

- Buyer requests.

- Rental requests.

- Customers.

- Appointments.

- Tasks.

- Follow-up history.



Export formats:



- CSV.

- Excel.

- Printable PDF where supported.



Create:



- Automatic daily cloud backup.

- Manual backup button.

- Data restoration option.

- Database import option where possible.



17. Security and privacy



Implement:



- Secure login.

- Password reset.

- PIN lock.

- Biometric lock when supported.

- Automatic session timeout.

- Secure cloud storage.

- Protected private property notes.

- Protected owner documents.

- Input validation.

- Duplicate phone number detection.

- Confirmation before deleting records.

- Soft delete and archive instead of immediate permanent deletion.

- Activity log for important changes.



18. Duplicate detection



When adding a phone number, check whether it already exists.



If the number exists, show:



- Existing customer name.

- Existing customer type.

- Existing request.

- Existing properties.

- Last contact date.



Allow the user to:



- Open the existing profile.

- Add a new request to the same customer.

- Add another property to the same owner.

- Merge duplicate records.

- Continue only after confirmation.



19. Application navigation



Create a bottom mobile navigation bar with:



- الرئيسية

- المواعيد

- العقارات

- العملاء

- المزيد



Inside “المزيد”, include:



- أصحاب العقارات

- طلبات العقارات

- المهام اليومية

- المتابعات

- الإشعارات

- التقارير

- الإعدادات



Include a floating “+” button for quickly adding:



- Appointment.

- Property.

- Property owner.

- Property request.

- Task.

- Follow-up.



20. Design system



Use a professional real estate visual style.



Design requirements:



- Arabic RTL layout.

- Clean cards.

- Large readable Arabic typography.

- Clear action icons.

- Orange as the main accent color.

- Dark gray and white supporting colors.

- Optional dark mode.

- High contrast.

- Large tap targets.

- Minimal clutter.

- Mobile-friendly forms.

- Step-by-step property creation form.

- Status colors used consistently.

- Professional empty states.

- Loading indicators.

- Confirmation messages.

- Error messages in Arabic.



Suggested interface colors:



- Primary orange: #FF8A00

- Dark gray: #242424

- Light background: #F6F7F9

- White: #FFFFFF



Use Arabic labels and realistic Arabic sample data throughout the prototype.



21. Required pages



Build all of these pages:



1. Login.

2. Forgot password.

3. Main dashboard.

4. Daily calendar.

5. Weekly calendar.

6. Monthly calendar.

7. Appointment list.

8. Add appointment.

9. Appointment details.

10. Property owner list.

11. Add property owner.

12. Property owner profile.

13. Property list.

14. Add property.

15. Property details.

16. Property image gallery.

17. Property edit page.

18. Buyer and tenant request list.

19. Add property request.

20. Property request details.

21. Matching properties page.

22. Matching customers page.

23. Daily tasks list.

24. Add task.

25. Task details.

26. Follow-up dashboard.

27. Add follow-up.

28. Activity timeline.

29. Notifications center.

30. Global search.

31. Reports.

32. Data export.

33. Backup and restore.

34. WhatsApp templates.

35. Notification settings.

36. Profile settings.

37. Security settings.



22. Database entities



Create proper relational database tables or collections for:



- Users.

- Customers.

- Property owners.

- Phone numbers.

- Properties.

- Property images.

- Property videos.

- Property documents.

- Property requests.

- Request preferred areas.

- Appointments.

- Tasks.

- Follow-ups.

- Activities.

- Notifications.

- Property-customer matches.

- WhatsApp templates.

- Application settings.

- Backup records.

- Audit logs.



Use relationships correctly. One property owner can own multiple properties. One customer can have multiple property requests. One property request can match multiple properties. One property can match multiple customers.



23. Application logic



Implement working application logic, not only visual screens.



Required functionality:



- Create, read, edit, archive, and restore records.

- Persist all records in the database.

- Upload and display property images.

- Schedule reminders.

- Detect overdue follow-ups.

- Detect duplicate phone numbers.

- Match customers with properties.

- Open phone dialer.

- Open WhatsApp conversations.

- Search and filter all records.

- Add activities to timelines.

- Update statuses.

- Export data.

- Display dashboard statistics.

- Support Arabic RTL correctly.



24. Important alarm limitation and required implementation



Reliable alarm functionality is a critical requirement.



Do not rely only on browser notifications.



When building for Androi

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sky-land-pro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6003005a-9bf0-4959-8fd8-e83cf029a586).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
