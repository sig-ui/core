---- MODULE Tabs ----
\* Auto-generated from @sig-ui/core/machines/tabs.js
\* Model-based testing spec for Apalache MC
\*
\* States:   idle, focused
\* Events:   FOCUS, SELECT, BLUR, NEXT, PREV, FIRST, LAST

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"idle", "focused"}
Events == {"FOCUS", "SELECT", "BLUR", "NEXT", "PREV", "FIRST", "LAST"}
Edges == {"Idle_Focus", "Idle_Select", "Focused_Blur", "Focused_Select", "Focused_Next", "Focused_Prev", "Focused_First", "Focused_Last"}

Init ==
  /\ state = "idle"
  /\ edge = "Init"

\* idle --FOCUS--> focused
Idle_Focus ==
  /\ state = "idle"
  /\ state' = "focused"
  /\ edge' = "Idle_Focus"

\* idle --SELECT--> idle
Idle_Select ==
  /\ state = "idle"
  /\ state' = "idle"
  /\ edge' = "Idle_Select"

\* focused --BLUR--> idle
Focused_Blur ==
  /\ state = "focused"
  /\ state' = "idle"
  /\ edge' = "Focused_Blur"

\* focused --SELECT--> focused
Focused_Select ==
  /\ state = "focused"
  /\ state' = "focused"
  /\ edge' = "Focused_Select"

\* focused --NEXT--> focused
Focused_Next ==
  /\ state = "focused"
  /\ state' = "focused"
  /\ edge' = "Focused_Next"

\* focused --PREV--> focused
Focused_Prev ==
  /\ state = "focused"
  /\ state' = "focused"
  /\ edge' = "Focused_Prev"

\* focused --FIRST--> focused
Focused_First ==
  /\ state = "focused"
  /\ state' = "focused"
  /\ edge' = "Focused_First"

\* focused --LAST--> focused
Focused_Last ==
  /\ state = "focused"
  /\ state' = "focused"
  /\ edge' = "Focused_Last"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Idle_Focus
  \/ Idle_Select
  \/ Focused_Blur
  \/ Focused_Select
  \/ Focused_Next
  \/ Focused_Prev
  \/ Focused_First
  \/ Focused_Last

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
NotIn_Focused == state /= "focused"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Idle_Focus == edge /= "Idle_Focus"
NoEdge_Idle_Select == edge /= "Idle_Select"
NoEdge_Focused_Blur == edge /= "Focused_Blur"
NoEdge_Focused_Select == edge /= "Focused_Select"
NoEdge_Focused_Next == edge /= "Focused_Next"
NoEdge_Focused_Prev == edge /= "Focused_Prev"
NoEdge_Focused_First == edge /= "Focused_First"
NoEdge_Focused_Last == edge /= "Focused_Last"

====
