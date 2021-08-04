package com.bsse.dataClasses;

import java.util.Map;
import java.util.Set;
import org.eclipse.jgit.lib.IndexDiff.StageState;

public class StatusResult {
	public final Set<String> stagedChanges;
	public final Set<String> unStagedChanges;
	public final Set<String> conflictedChanges;
	public final Map<String, StageState> stagedConflictedChanges;
	
	public StatusResult(Set<String> unStagedChanges, Set<String> stagedChanges, Set<String> conflictedChanges,
			Map<String, StageState> stagedConflictedChanges) {
		this.stagedChanges = stagedChanges;
		this.unStagedChanges = unStagedChanges;
		this.conflictedChanges = conflictedChanges;
		this.stagedConflictedChanges = stagedConflictedChanges;		
	}
	
}
