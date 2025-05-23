you could also consider react-native-pan-pinch-view

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