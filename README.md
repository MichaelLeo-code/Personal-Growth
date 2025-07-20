you could also consider react-native-pan-pinch-view

#### Known issues
- too much totalSum and totalCompletedSum calls

Current to-do scope:
[ ] log out in profile instead
[ ] multiple panes

backlogish:
[ ] Emoji functionality
[ ] Statistics
[ ] Lock icon os subsequent tasklists
[ ] Fix how modals look. Fix the naming behavior.
[ ] Add arrows to show parent/children relationship
[ ] Fix delete, so that children are also deleted

BUGS:
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
