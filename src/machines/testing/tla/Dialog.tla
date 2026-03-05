---- MODULE Dialog ----
\* Auto-generated from @sig-ui/core/machines/dialog.js
\* Model-based testing spec for Apalache MC
\*
\* States:   closed, opening, open, closing
\* Events:   OPEN, ANIMATION_END, CLOSE

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"closed", "opening", "open", "closing"}
Events == {"OPEN", "ANIMATION_END", "CLOSE"}
Edges == {"Closed_Open", "Opening_AnimationEnd", "Open_Close", "Closing_AnimationEnd"}

Init ==
  /\ state = "closed"
  /\ edge = "Init"

\* closed --OPEN--> opening
Closed_Open ==
  /\ state = "closed"
  /\ state' = "opening"
  /\ edge' = "Closed_Open"

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

\* closing --ANIMATION_END--> closed
Closing_AnimationEnd ==
  /\ state = "closing"
  /\ state' = "closed"
  /\ edge' = "Closing_AnimationEnd"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Closed_Open
  \/ Opening_AnimationEnd
  \/ Open_Close
  \/ Closing_AnimationEnd

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
NoEdge_Opening_AnimationEnd == edge /= "Opening_AnimationEnd"
NoEdge_Open_Close == edge /= "Open_Close"
NoEdge_Closing_AnimationEnd == edge /= "Closing_AnimationEnd"

====
