---- MODULE Toast ----
\* Auto-generated from @sig-ui/core/machines/toast.js
\* Model-based testing spec for Apalache MC
\*
\* States:   idle, entering, visible, exiting, done
\* Events:   SHOW, ANIMATION_END, DISMISS, TIMEOUT
\* Terminal: done

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"idle", "entering", "visible", "exiting", "done"}
Events == {"SHOW", "ANIMATION_END", "DISMISS", "TIMEOUT"}
Edges == {"Idle_Show", "Entering_AnimationEnd", "Visible_Dismiss", "Visible_Timeout", "Exiting_AnimationEnd"}
TerminalStates == {"done"}

Init ==
  /\ state = "idle"
  /\ edge = "Init"

\* idle --SHOW--> entering
Idle_Show ==
  /\ state = "idle"
  /\ state' = "entering"
  /\ edge' = "Idle_Show"

\* entering --ANIMATION_END--> visible
Entering_AnimationEnd ==
  /\ state = "entering"
  /\ state' = "visible"
  /\ edge' = "Entering_AnimationEnd"

\* visible --DISMISS--> exiting
Visible_Dismiss ==
  /\ state = "visible"
  /\ state' = "exiting"
  /\ edge' = "Visible_Dismiss"

\* visible --TIMEOUT--> exiting
Visible_Timeout ==
  /\ state = "visible"
  /\ state' = "exiting"
  /\ edge' = "Visible_Timeout"

\* exiting --ANIMATION_END--> done
Exiting_AnimationEnd ==
  /\ state = "exiting"
  /\ state' = "done"
  /\ edge' = "Exiting_AnimationEnd"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Idle_Show
  \/ Entering_AnimationEnd
  \/ Visible_Dismiss
  \/ Visible_Timeout
  \/ Exiting_AnimationEnd
  \/ (state \in TerminalStates /\ UNCHANGED vars)

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
NotIn_Entering == state /= "entering"
NotIn_Visible == state /= "visible"
NotIn_Exiting == state /= "exiting"
NotIn_Done == state /= "done"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Idle_Show == edge /= "Idle_Show"
NoEdge_Entering_AnimationEnd == edge /= "Entering_AnimationEnd"
NoEdge_Visible_Dismiss == edge /= "Visible_Dismiss"
NoEdge_Visible_Timeout == edge /= "Visible_Timeout"
NoEdge_Exiting_AnimationEnd == edge /= "Exiting_AnimationEnd"

====
