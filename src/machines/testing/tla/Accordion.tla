---- MODULE Accordion ----
\* Auto-generated from @sig-ui/core/machines/accordion.js
\* Model-based testing spec for Apalache MC
\*
\* States:   idle
\* Events:   TOGGLE, OPEN, CLOSE

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"idle"}
Events == {"TOGGLE", "OPEN", "CLOSE"}
Edges == {"Idle_Toggle", "Idle_Open", "Idle_Close"}

Init ==
  /\ state = "idle"
  /\ edge = "Init"

\* idle --TOGGLE--> idle
Idle_Toggle ==
  /\ state = "idle"
  /\ state' = "idle"
  /\ edge' = "Idle_Toggle"

\* idle --OPEN--> idle
Idle_Open ==
  /\ state = "idle"
  /\ state' = "idle"
  /\ edge' = "Idle_Open"

\* idle --CLOSE--> idle
Idle_Close ==
  /\ state = "idle"
  /\ state' = "idle"
  /\ edge' = "Idle_Close"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Idle_Toggle
  \/ Idle_Open
  \/ Idle_Close

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

NotIn_Idle == state /= "idle"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Idle_Toggle == edge /= "Idle_Toggle"
NoEdge_Idle_Open == edge /= "Idle_Open"
NoEdge_Idle_Close == edge /= "Idle_Close"

====
