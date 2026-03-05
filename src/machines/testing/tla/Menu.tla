---- MODULE Menu ----
\* Auto-generated from @sig-ui/core/machines/menu.js
\* Model-based testing spec for Apalache MC
\*
\* States:   closed, open
\* Events:   OPEN, TOGGLE, CLOSE, SELECT, FOCUS_NEXT, FOCUS_PREV

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"closed", "open"}
Events == {"OPEN", "TOGGLE", "CLOSE", "SELECT", "FOCUS_NEXT", "FOCUS_PREV"}
Edges == {"Closed_Open", "Closed_Toggle", "Open_Close", "Open_Toggle", "Open_Select", "Open_FocusNext", "Open_FocusPrev"}

Init ==
  /\ state = "closed"
  /\ edge = "Init"

\* closed --OPEN--> open
Closed_Open ==
  /\ state = "closed"
  /\ state' = "open"
  /\ edge' = "Closed_Open"

\* closed --TOGGLE--> open
Closed_Toggle ==
  /\ state = "closed"
  /\ state' = "open"
  /\ edge' = "Closed_Toggle"

\* open --CLOSE--> closed
Open_Close ==
  /\ state = "open"
  /\ state' = "closed"
  /\ edge' = "Open_Close"

\* open --TOGGLE--> closed
Open_Toggle ==
  /\ state = "open"
  /\ state' = "closed"
  /\ edge' = "Open_Toggle"

\* open --SELECT--> closed
Open_Select ==
  /\ state = "open"
  /\ state' = "closed"
  /\ edge' = "Open_Select"

\* open --FOCUS_NEXT--> open
Open_FocusNext ==
  /\ state = "open"
  /\ state' = "open"
  /\ edge' = "Open_FocusNext"

\* open --FOCUS_PREV--> open
Open_FocusPrev ==
  /\ state = "open"
  /\ state' = "open"
  /\ edge' = "Open_FocusPrev"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Closed_Open
  \/ Closed_Toggle
  \/ Open_Close
  \/ Open_Toggle
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

NoEdge_Closed_Open == edge /= "Closed_Open"
NoEdge_Closed_Toggle == edge /= "Closed_Toggle"
NoEdge_Open_Close == edge /= "Open_Close"
NoEdge_Open_Toggle == edge /= "Open_Toggle"
NoEdge_Open_Select == edge /= "Open_Select"
NoEdge_Open_FocusNext == edge /= "Open_FocusNext"
NoEdge_Open_FocusPrev == edge /= "Open_FocusPrev"

====
