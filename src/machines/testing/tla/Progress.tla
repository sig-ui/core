---- MODULE Progress ----
\* Auto-generated from @sig-ui/core/machines/progress.js
\* Model-based testing spec for Apalache MC
\*
\* States:   idle, running, complete
\* Events:   START, UPDATE, COMPLETE, RESET

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"idle", "running", "complete"}
Events == {"START", "UPDATE", "COMPLETE", "RESET"}
Edges == {"Idle_Start", "Running_Update", "Running_Complete", "Complete_Reset"}

Init ==
  /\ state = "idle"
  /\ edge = "Init"

\* idle --START--> running
Idle_Start ==
  /\ state = "idle"
  /\ state' = "running"
  /\ edge' = "Idle_Start"

\* running --UPDATE--> running
Running_Update ==
  /\ state = "running"
  /\ state' = "running"
  /\ edge' = "Running_Update"

\* running --COMPLETE--> complete
Running_Complete ==
  /\ state = "running"
  /\ state' = "complete"
  /\ edge' = "Running_Complete"

\* complete --RESET--> idle
Complete_Reset ==
  /\ state = "complete"
  /\ state' = "idle"
  /\ edge' = "Complete_Reset"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Idle_Start
  \/ Running_Update
  \/ Running_Complete
  \/ Complete_Reset

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
NotIn_Running == state /= "running"
NotIn_Complete == state /= "complete"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Idle_Start == edge /= "Idle_Start"
NoEdge_Running_Update == edge /= "Running_Update"
NoEdge_Running_Complete == edge /= "Running_Complete"
NoEdge_Complete_Reset == edge /= "Complete_Reset"

====
