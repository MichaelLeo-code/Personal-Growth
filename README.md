you could also consider react-native-pan-pinch-view

#### Known issues

- too much totalSum and totalCompletedSum calls

Current to-do scope:
[x] add localstorage (currently, i want you to implement local storage of the grid, writing it to the JSON file. but keep in mind that it has to follow dependency injection principle so that we could replace it with database later
But keep in mind that this is react native app, so it cant use fs library)
[x] separate buttons for headline and tasklist
[x] occupy the coordinates of larger-than-one-tiles (probably create coordinates store for that)  
[x] Create tasks in taskstore cell

[x] Add drag and drop
[ ] Add firestore + auth
[x] Name edit for Heading
[ ] Move cell on long press
[ ] Emoji functionality
[ ] Statistics 
[ ] Is daily switch - or maybe daily tasks could be on headlines instead
[ ] Lock icon os subsequent tasklists

[ ] Is TaskLine written in the best practice?

BUGS:
[ ] Theme
[x] Lines are limited by canvas
[ ] Progress bar not seen on the small cell

### Questions

##### GridStore

- next adjacent cell methods
- assign parent if cell is selected

### Resolved Questions

##### Model

- reference parent as id or x, y? **ID**
- Reference children's needed? **yes**
  Pros:

  - Enables quick lookup of a node's subtree.
  - **Enable view of only certain levels**

  Cons:

  - Needs strict synchronization
  - JSON.stringify becomes problematic.
