---- MODULE Select ----
\* Auto-generated from @sig-ui/core/machines/select.js
\* Model-based testing spec for Apalache MC
\*
\* States:   closed, open
\* Events:   TOGGLE, OPEN, CLOSE, SELECT, FOCUS_NEXT, FOCUS_PREV
\* Guards:   hasSelection

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge,
  \* @type: Bool;
  guard_hasSelection

States == {"closed", "open"}
Events == {"TOGGLE", "OPEN", "CLOSE", "SELECT", "FOCUS_NEXT", "FOCUS_PREV"}
Edges == {"Closed_Toggle", "Closed_Open", "Open_Toggle", "Open_Close", "Open_Select", "Open_FocusNext", "Open_FocusPrev"}

Init ==
  /\ state = "closed"
  /\ edge = "Init"
  /\ guard_hasSelection \in BOOLEAN

\* closed --TOGGLE--> open
Closed_Toggle ==
  /\ state = "closed"
  /\ state' = "open"
  /\ edge' = "Closed_Toggle"
  /\ guard_hasSelection' \in BOOLEAN

\* closed --OPEN--> open
Closed_Open ==
  /\ state = "closed"
  /\ state' = "open"
  /\ edge' = "Closed_Open"
  /\ guard_hasSelection' \in BOOLEAN

\* open --TOGGLE--> closed
Open_Toggle ==
  /\ state = "open"
  /\ state' = "closed"
  /\ edge' = "Open_Toggle"
  /\ guard_hasSelection' \in BOOLEAN

\* open --CLOSE--> closed
Open_Close ==
  /\ state = "open"
  /\ state' = "closed"
  /\ edge' = "Open_Close"
  /\ guard_hasSelection' \in BOOLEAN

\* open --SELECT [guard: hasSelection]--> closed
Open_Select ==
  /\ state = "open"
  /\ guard_hasSelection = TRUE
  /\ state' = "closed"
  /\ edge' = "Open_Select"
  /\ guard_hasSelection' \in BOOLEAN

\* open --FOCUS_NEXT--> open
Open_FocusNext ==
  /\ state = "open"
  /\ state' = "open"
  /\ edge' = "Open_FocusNext"
  /\ guard_hasSelection' \in BOOLEAN

\* open --FOCUS_PREV--> open
Open_FocusPrev ==
  /\ state = "open"
  /\ state' = "open"
  /\ edge' = "Open_FocusPrev"
  /\ guard_hasSelection' \in BOOLEAN

\* @type: <<Str, Str, Bool>>;
vars == <<state, edge, guard_hasSelection>>

Next ==
  \/ Closed_Toggle
  \/ Closed_Open
  \/ Open_Toggle
  \/ Open_Close
  \/ Open_Select
  \/ Open_FocusNext
  \/ Open_FocusPrev

\* ================================================================
\* Invariants
\* ================================================================

TypeOK ==
  /\ state \in States
  /\ edge \in Edges \union {"Init"}

\* All non-terminal states have at least one unguarded transition.
\* Deadlock is structurally impossible.
NoDeadlock == TRUE

\* ================================================================
\* Reachability (counterexample proves the state is reachable)
\* ================================================================

NotIn_Closed == state /= "closed"
NotIn_Open == state /= "open"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Closed_Toggle == edge /= "Closed_Toggle"
NoEdge_Closed_Open == edge /= "Closed_Open"
NoEdge_Open_Toggle == edge /= "Open_Toggle"
NoEdge_Open_Close == edge /= "Open_Close"
NoEdge_Open_Select == edge /= "Open_Select"
NoEdge_Open_FocusNext == edge /= "Open_FocusNext"
NoEdge_Open_FocusPrev == edge /= "Open_FocusPrev"

====
