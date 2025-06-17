you could also consider react-native-pan-pinch-view

#### Known issues

- too much totalSum and totalCompletedSum calls

Current to-do scope:
[x] add localstorage (currently, i want you to implement local storage of the grid, writing it to the JSON file. but keep in mind that it has to follow dependency injection principle so that we could replace it with database later
But keep in mind that this is react native app, so it cant use fs library)
[x] separate buttons for headline and tasklist
[x] occupy the coordinates of larger-than-one-tiles (probably create coordinates store for that)  
[x] Create tasks in taskstore cell

[ ] Add drag and drop
[ ] Add firestore + auth

[ ] Is TaskLine written in the best practice?

BUGS:
[ ] Theme
[ ] Lines are limited by canvas

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
