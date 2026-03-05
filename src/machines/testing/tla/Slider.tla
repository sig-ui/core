---- MODULE Slider ----
\* Auto-generated from @sig-ui/core/machines/slider.js
\* Model-based testing spec for Apalache MC
\*
\* States:   idle, dragging, focused
\* Events:   DRAG_START, FOCUS, DRAG_END, BLUR, INCREMENT, DECREMENT

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"idle", "dragging", "focused"}
Events == {"DRAG_START", "FOCUS", "DRAG_END", "BLUR", "INCREMENT", "DECREMENT"}
Edges == {"Idle_DragStart", "Idle_Focus", "Dragging_DragEnd", "Focused_Blur", "Focused_DragStart", "Focused_Increment", "Focused_Decrement"}

Init ==
  /\ state = "idle"
  /\ edge = "Init"

\* idle --DRAG_START--> dragging
Idle_DragStart ==
  /\ state = "idle"
  /\ state' = "dragging"
  /\ edge' = "Idle_DragStart"

\* idle --FOCUS--> focused
Idle_Focus ==
  /\ state = "idle"
  /\ state' = "focused"
  /\ edge' = "Idle_Focus"

\* dragging --DRAG_END--> idle
Dragging_DragEnd ==
  /\ state = "dragging"
  /\ state' = "idle"
  /\ edge' = "Dragging_DragEnd"

\* focused --BLUR--> idle
Focused_Blur ==
  /\ state = "focused"
  /\ state' = "idle"
  /\ edge' = "Focused_Blur"

\* focused --DRAG_START--> dragging
Focused_DragStart ==
  /\ state = "focused"
  /\ state' = "dragging"
  /\ edge' = "Focused_DragStart"

\* focused --INCREMENT--> focused
Focused_Increment ==
  /\ state = "focused"
  /\ state' = "focused"
  /\ edge' = "Focused_Increment"

\* focused --DECREMENT--> focused
Focused_Decrement ==
  /\ state = "focused"
  /\ state' = "focused"
  /\ edge' = "Focused_Decrement"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Idle_DragStart
  \/ Idle_Focus
  \/ Dragging_DragEnd
  \/ Focused_Blur
  \/ Focused_DragStart
  \/ Focused_Increment
  \/ Focused_Decrement

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
NotIn_Dragging == state /= "dragging"
NotIn_Focused == state /= "focused"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Idle_DragStart == edge /= "Idle_DragStart"
NoEdge_Idle_Focus == edge /= "Idle_Focus"
NoEdge_Dragging_DragEnd == edge /= "Dragging_DragEnd"
NoEdge_Focused_Blur == edge /= "Focused_Blur"
NoEdge_Focused_DragStart == edge /= "Focused_DragStart"
NoEdge_Focused_Increment == edge /= "Focused_Increment"
NoEdge_Focused_Decrement == edge /= "Focused_Decrement"

====
