---- MODULE AlertDialog ----
\* Auto-generated from @sig-ui/core/machines/alertDialog.js
\* Model-based testing spec for Apalache MC
\*
\* States:   closed, opening, open, closing
\* Events:   OPEN, ANIMATION_END, CLOSE
\* Guards:   canDismiss

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge,
  \* @type: Bool;
  requiresAction

States == {"closed", "opening", "open", "closing"}
Events == {"OPEN", "ANIMATION_END", "CLOSE"}
Edges == {"Closed_Open", "Opening_AnimationEnd", "Open_Close", "Closing_AnimationEnd"}

Init ==
  /\ state = "closed"
  /\ edge = "Init"
  /\ requiresAction \in BOOLEAN

\* closed --OPEN--> opening
Closed_Open ==
  /\ state = "closed"
  /\ state' = "opening"
  /\ edge' = "Closed_Open"
  /\ UNCHANGED requiresAction

\* opening --ANIMATION_END--> open
Opening_AnimationEnd ==
  /\ state = "opening"
  /\ state' = "open"
  /\ edge' = "Opening_AnimationEnd"
  /\ UNCHANGED requiresAction

\* open --CLOSE [guard: canDismiss]--> closing
Open_Close ==
  /\ state = "open"
  /\ requiresAction = FALSE
  /\ state' = "closing"
  /\ edge' = "Open_Close"
  /\ UNCHANGED requiresAction

\* closing --ANIMATION_END--> closed
Closing_AnimationEnd ==
  /\ state = "closing"
  /\ state' = "closed"
  /\ edge' = "Closing_AnimationEnd"
  /\ UNCHANGED requiresAction

\* @type: <<Str, Str, Bool>>;
vars == <<state, edge, requiresAction>>

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

\* Deadlock is possible in states where all exits are guarded.
\* CanDeadlock_* invariants prove (via counterexample) that these are reachable.

\* Deadlock: open with all guards blocking
CanDeadlock_Open == ~(state = "open" /\ ~(requiresAction = FALSE))

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

\* ================================================================
\* Guard & context properties
\* ================================================================

\* Closing is only reachable when the dialog is dismissable
ClosingImpliesDismissable == state = "closing" => requiresAction = FALSE

====
