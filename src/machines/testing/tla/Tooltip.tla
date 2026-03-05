---- MODULE Tooltip ----
\* Auto-generated from @sig-ui/core/machines/tooltip.js
\* Model-based testing spec for Apalache MC
\*
\* States:   idle, waiting, visible, hiding
\* Events:   POINTER_ENTER, FOCUS, POINTER_LEAVE, BLUR, DELAY_END, ANIMATION_END

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"idle", "waiting", "visible", "hiding"}
Events == {"POINTER_ENTER", "FOCUS", "POINTER_LEAVE", "BLUR", "DELAY_END", "ANIMATION_END"}
Edges == {"Idle_PointerEnter", "Idle_Focus", "Waiting_PointerLeave", "Waiting_Blur", "Waiting_DelayEnd", "Visible_PointerLeave", "Visible_Blur", "Hiding_PointerEnter", "Hiding_Focus", "Hiding_AnimationEnd"}

Init ==
  /\ state = "idle"
  /\ edge = "Init"

\* idle --POINTER_ENTER--> waiting
Idle_PointerEnter ==
  /\ state = "idle"
  /\ state' = "waiting"
  /\ edge' = "Idle_PointerEnter"

\* idle --FOCUS--> waiting
Idle_Focus ==
  /\ state = "idle"
  /\ state' = "waiting"
  /\ edge' = "Idle_Focus"

\* waiting --POINTER_LEAVE--> idle
Waiting_PointerLeave ==
  /\ state = "waiting"
  /\ state' = "idle"
  /\ edge' = "Waiting_PointerLeave"

\* waiting --BLUR--> idle
Waiting_Blur ==
  /\ state = "waiting"
  /\ state' = "idle"
  /\ edge' = "Waiting_Blur"

\* waiting --DELAY_END--> visible
Waiting_DelayEnd ==
  /\ state = "waiting"
  /\ state' = "visible"
  /\ edge' = "Waiting_DelayEnd"

\* visible --POINTER_LEAVE--> hiding
Visible_PointerLeave ==
  /\ state = "visible"
  /\ state' = "hiding"
  /\ edge' = "Visible_PointerLeave"

\* visible --BLUR--> hiding
Visible_Blur ==
  /\ state = "visible"
  /\ state' = "hiding"
  /\ edge' = "Visible_Blur"

\* hiding --POINTER_ENTER--> visible
Hiding_PointerEnter ==
  /\ state = "hiding"
  /\ state' = "visible"
  /\ edge' = "Hiding_PointerEnter"

\* hiding --FOCUS--> visible
Hiding_Focus ==
  /\ state = "hiding"
  /\ state' = "visible"
  /\ edge' = "Hiding_Focus"

\* hiding --ANIMATION_END--> idle
Hiding_AnimationEnd ==
  /\ state = "hiding"
  /\ state' = "idle"
  /\ edge' = "Hiding_AnimationEnd"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Idle_PointerEnter
  \/ Idle_Focus
  \/ Waiting_PointerLeave
  \/ Waiting_Blur
  \/ Waiting_DelayEnd
  \/ Visible_PointerLeave
  \/ Visible_Blur
  \/ Hiding_PointerEnter
  \/ Hiding_Focus
  \/ Hiding_AnimationEnd

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
NotIn_Waiting == state /= "waiting"
NotIn_Visible == state /= "visible"
NotIn_Hiding == state /= "hiding"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Idle_PointerEnter == edge /= "Idle_PointerEnter"
NoEdge_Idle_Focus == edge /= "Idle_Focus"
NoEdge_Waiting_PointerLeave == edge /= "Waiting_PointerLeave"
NoEdge_Waiting_Blur == edge /= "Waiting_Blur"
NoEdge_Waiting_DelayEnd == edge /= "Waiting_DelayEnd"
NoEdge_Visible_PointerLeave == edge /= "Visible_PointerLeave"
NoEdge_Visible_Blur == edge /= "Visible_Blur"
NoEdge_Hiding_PointerEnter == edge /= "Hiding_PointerEnter"
NoEdge_Hiding_Focus == edge /= "Hiding_Focus"
NoEdge_Hiding_AnimationEnd == edge /= "Hiding_AnimationEnd"

====
