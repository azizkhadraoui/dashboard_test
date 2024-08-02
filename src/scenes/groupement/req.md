# Requirements for Client Grouping and Room Distribution

## Task Overview

The task involves fetching clients from the clients collection, verifying flight details from the flights subcollection, and grouping these clients into rooms of four based on similar gender and minimal age difference. The grouped rooms should then be saved into a new collection with the press of a button.

## Detailed Requirements

### Fetching Clients

1. _Clients Collection:_

   - Retrieve clients from the clients collection.

2. _Flights Subcollection:_
   - Verify flight details within the flights subcollection for each client.
   - _Criteria for Filtering Flights:_
     - date: Ensure the flight date matches the specified date.
     - type: Ensure the flight type matches the specified type.
     - groupId: Ensure the groupId starts with "room of four".

### Grouping Clients

3. _Group by Gender:_

   - Group clients by gender (male, female, etc.).

4. _Minimal Age Difference:_

   - Within each gender group, sort clients by age.
   - Create rooms of four clients with minimal age differences within each room.

5. _Room Creation:_
   - Each room should contain exactly four clients.
   - If there are remaining clients that do not fit into a room of four, handle them appropriately (e.g., create smaller groups or allocate to existing rooms).

### Saving Room Distribution

6. _Button Press Action:_

   - Implement a button to save the room distribution.
   - On button press, save the grouped room data into a new collection.

7. _New Collection:_
   - Define a new collection to store the room distribution.
   - Store the following details for each room:
     - Room ID
     - List of clients in the room
     - Gender
     - Age details (e.g., minimum, maximum, average age)
     - Date and type of the flight

### Additional Considerations

8. _Error Handling:_

   - Handle any errors that may occur during data fetching, grouping, or saving.
   - Provide feedback to the user in case of errors.

9. _User Interface:_

   - Ensure the user interface clearly displays the fetched clients, grouped rooms, and the save button.
   - Provide confirmation to the user once the rooms are successfully saved.

10. _Performance:_
    - Ensure the process of fetching, grouping, and saving clients is efficient, especially for large datasets.

### Summary

- Fetch clients from clients collection.
- Verify flights in the flights subcollection based on date, type, and groupId.
- Group clients into rooms of four by gender and minimal age difference.
- Save the room distribution into a new collection with the press of a button.

These requirements should guide the development process and ensure the task is completed accurately and efficiently.
relevant firbase structures:
clients(collection):
client(doc with random id):
birthday (yyyy-mm--dd string)
deligation(string)
firstName(string)
from(string)
lastName(string)
passportNumber(string)
phone(string)
sex(string)"male" or 'female'
tags(array of strings)
flights(subcollection):
flight(doc with random id)
flight_date(yyyy-mm--dd string)
group_id(string)roomtype-random id

sessions(collection):
session(doc with session name):
date(string)
time(string)
title(string)
rooms(subcollection):
room(doc with random id):
the doç contains rooms every room has this structure:(array format)
name[price,capacity] both in string

<!-- this is an independant collection it doesnt have any common data with the fligght subcollection in client except the date of flight we will make the laison between them using the date -->

flights(collection):
flight(doc with random id)
date(yyyy-mm--dd string)
type(string)refers what session this flight belongs to
