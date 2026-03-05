---- MODULE Popover ----
\* Auto-generated from @sig-ui/core/machines/popover.js
\* Model-based testing spec for Apalache MC
\*
\* States:   closed, opening, open, closing
\* Events:   OPEN, TOGGLE, ANIMATION_END, CLOSE

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"closed", "opening", "open", "closing"}
Events == {"OPEN", "TOGGLE", "ANIMATION_END", "CLOSE"}
Edges == {"Closed_Open", "Closed_Toggle", "Opening_AnimationEnd", "Open_Close", "Open_Toggle", "Closing_AnimationEnd", "Closing_Open"}

Init ==
  /\ state = "closed"
  /\ edge = "Init"

\* closed --OPEN--> opening
Closed_Open ==
  /\ state = "closed"
  /\ state' = "opening"
  /\ edge' = "Closed_Open"

\* closed --TOGGLE--> opening
Closed_Toggle ==
  /\ state = "closed"
  /\ state' = "opening"
  /\ edge' = "Closed_Toggle"

\* opening --ANIMATION_END--> open
Opening_AnimationEnd ==
  /\ state = "opening"
  /\ state' = "open"
  /\ edge' = "Opening_AnimationEnd"

\* open --CLOSE--> closing
Open_Close ==
  /\ state = "open"
  /\ state' = "closing"
  /\ edge' = "Open_Close"

\* open --TOGGLE--> closing
Open_Toggle ==
  /\ state = "open"
  /\ state' = "closing"
  /\ edge' = "Open_Toggle"

\* closing --ANIMATION_END--> closed
Closing_AnimationEnd ==
  /\ state = "closing"
  /\ state' = "closed"
  /\ edge' = "Closing_AnimationEnd"

\* closing --OPEN--> opening
Closing_Open ==
  /\ state = "closing"
  /\ state' = "opening"
  /\ edge' = "Closing_Open"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Closed_Open
  \/ Closed_Toggle
  \/ Opening_AnimationEnd
  \/ Open_Close
  \/ Open_Toggle
  \/ Closing_AnimationEnd
  \/ Closing_Open

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
NotIn_Opening == state /= "opening"
NotIn_Open == state /= "open"
NotIn_Closing == state /= "closing"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Closed_Open == edge /= "Closed_Open"
NoEdge_Closed_Toggle == edge /= "Closed_Toggle"
NoEdge_Opening_AnimationEnd == edge /= "Opening_AnimationEnd"
NoEdge_Open_Close == edge /= "Open_Close"
NoEdge_Open_Toggle == edge /= "Open_Toggle"
NoEdge_Closing_AnimationEnd == edge /= "Closing_AnimationEnd"
NoEdge_Closing_Open == edge /= "Closing_Open"

====
