you could also consider react-native-pan-pinch-view

#### Known issues
- too much totalSum and totalCompletedSum calls

Current to-do scope:

backlogish:
[ ] Emoji functionality
[ ] Statistics
[ ] Lock icon on subsequent tasklists
[ ] Add arrows to show parent/children relationship
[ ] Fix delete, so that children are also deleted
[ ] log out in profile instead
[ ] multiple panes

BUGS:
[ ] Fix how modals look. (the task line is sitcking out on mobile) Fix the naming behavior. (have to explicitly press enter to save the entry. Closing the keyboard discards the input - should not be like that)
[ ] Progress bar not seen on the small cell on web

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
