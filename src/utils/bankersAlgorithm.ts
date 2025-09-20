// Banker's Algorithm Implementation for Deadlock Avoidance

export interface BankersState {
  processes: number;
  resources: number;
  allocation: number[][];
  max: number[][];
  available: number[];
  need: number[][];
}

export interface BankersResult {
  isSafe: boolean;
  safeSequence: number[];
  steps: string[];
  error?: string;
}

export class BankersAlgorithm {
  private state: BankersState;

  constructor(
    processes: number,
    resources: number,
    allocation: number[][],
    max: number[][],
    available: number[]
  ) {
    this.state = {
      processes,
      resources,
      allocation: allocation.map(row => [...row]),
      max: max.map(row => [...row]),
      available: [...available],
      need: this.calculateNeed(allocation, max)
    };
  }

  private calculateNeed(allocation: number[][], max: number[][]): number[][] {
    const need: number[][] = [];
    for (let i = 0; i < allocation.length; i++) {
      need[i] = [];
      for (let j = 0; j < allocation[i].length; j++) {
        need[i][j] = max[i][j] - allocation[i][j];
        if (need[i][j] < 0) {
          throw new Error(`Invalid state: Process ${i} allocated more than maximum for resource ${j}`);
        }
      }
    }
    return need;
  }

  private canAllocate(processIndex: number, work: number[]): boolean {
    for (let j = 0; j < this.state.resources; j++) {
      if (this.state.need[processIndex][j] > work[j]) {
        return false;
      }
    }
    return true;
  }

  private addResources(work: number[], processIndex: number): number[] {
    const newWork = [...work];
    for (let j = 0; j < this.state.resources; j++) {
      newWork[j] += this.state.allocation[processIndex][j];
    }
    return newWork;
  }

  public checkSafety(): BankersResult {
    const work = [...this.state.available];
    const finish = new Array(this.state.processes).fill(false);
    const safeSequence: number[] = [];
    const steps: string[] = [];

    steps.push(`Initial available resources: [${work.join(', ')}]`);
    steps.push('Starting safety check...');

    let found = true;
    let iteration = 0;

    while (found && safeSequence.length < this.state.processes) {
      found = false;
      iteration++;
      
      steps.push(`\n--- Iteration ${iteration} ---`);
      steps.push(`Current work vector: [${work.join(', ')}]`);
      steps.push(`Finished processes: [${finish.map((f, i) => f ? `P${i}` : '').filter(p => p).join(', ') || 'None'}]`);

      for (let i = 0; i < this.state.processes; i++) {
        if (!finish[i]) {
          steps.push(`\nChecking Process P${i}:`);
          steps.push(`  Need: [${this.state.need[i].join(', ')}]`);
          steps.push(`  Available: [${work.join(', ')}]`);

          if (this.canAllocate(i, work)) {
            steps.push(`  ✓ P${i} can be satisfied`);
            
            // Simulate process completion
            const newWork = this.addResources(work, i);
            steps.push(`  P${i} completes and releases: [${this.state.allocation[i].join(', ')}]`);
            steps.push(`  New available: [${newWork.join(', ')}]`);
            
            for (let j = 0; j < this.state.resources; j++) {
              work[j] = newWork[j];
            }
            
            finish[i] = true;
            safeSequence.push(i);
            found = true;
            break;
          } else {
            steps.push(`  ✗ P${i} cannot be satisfied (insufficient resources)`);
          }
        }
      }

      if (!found && safeSequence.length < this.state.processes) {
        steps.push('\n❌ No process can be satisfied with current resources');
        break;
      }
    }

    const isSafe = safeSequence.length === this.state.processes;
    
    if (isSafe) {
      steps.push(`\n✅ System is in SAFE state`);
      steps.push(`Safe sequence: P${safeSequence.join(' → P')}`);
    } else {
      steps.push(`\n⚠️ System is in UNSAFE state`);
      steps.push(`Only ${safeSequence.length}/${this.state.processes} processes can complete`);
      if (safeSequence.length > 0) {
        steps.push(`Partial sequence: P${safeSequence.join(' → P')}`);
      }
    }

    return {
      isSafe,
      safeSequence,
      steps
    };
  }

  public requestResources(processIndex: number, request: number[]): BankersResult {
    const steps: string[] = [];
    
    steps.push(`Process P${processIndex} requests: [${request.join(', ')}]`);
    
    // Check if request is valid
    for (let j = 0; j < this.state.resources; j++) {
      if (request[j] > this.state.need[processIndex][j]) {
        return {
          isSafe: false,
          safeSequence: [],
          steps,
          error: `Request exceeds maximum need for resource ${j}`
        };
      }
      
      if (request[j] > this.state.available[j]) {
        return {
          isSafe: false,
          safeSequence: [],
          steps,
          error: `Request exceeds available resources for resource ${j}`
        };
      }
    }

    steps.push('Request is within bounds, simulating allocation...');

    // Create a copy of the state for simulation
    const originalState = {
      allocation: this.state.allocation.map(row => [...row]),
      available: [...this.state.available],
      need: this.state.need.map(row => [...row])
    };

    // Simulate the allocation
    for (let j = 0; j < this.state.resources; j++) {
      this.state.available[j] -= request[j];
      this.state.allocation[processIndex][j] += request[j];
      this.state.need[processIndex][j] -= request[j];
    }

    steps.push(`After allocation:`);
    steps.push(`  Available: [${this.state.available.join(', ')}]`);
    steps.push(`  P${processIndex} allocation: [${this.state.allocation[processIndex].join(', ')}]`);
    steps.push(`  P${processIndex} need: [${this.state.need[processIndex].join(', ')}]`);

    // Check if the new state is safe
    const safetyResult = this.checkSafety();
    
    if (!safetyResult.isSafe) {
      // Restore original state
      this.state.allocation = originalState.allocation;
      this.state.available = originalState.available;
      this.state.need = originalState.need;
      
      steps.push('\n❌ Request denied - would lead to unsafe state');
      steps.push('State restored to previous safe state');
    } else {
      steps.push('\n✅ Request granted - system remains safe');
    }

    return {
      isSafe: safetyResult.isSafe,
      safeSequence: safetyResult.safeSequence,
      steps: [...steps, ...safetyResult.steps]
    };
  }

  public getState(): BankersState {
    return {
      processes: this.state.processes,
      resources: this.state.resources,
      allocation: this.state.allocation.map(row => [...row]),
      max: this.state.max.map(row => [...row]),
      available: [...this.state.available],
      need: this.state.need.map(row => [...row])
    };
  }

  public printState(): string {
    let output = '\n=== BANKER\'S ALGORITHM STATE ===\n';
    
    output += '\nAllocation Matrix:\n';
    output += '    ';
    for (let j = 0; j < this.state.resources; j++) {
      output += `R${j}  `;
    }
    output += '\n';
    
    for (let i = 0; i < this.state.processes; i++) {
      output += `P${i}  `;
      for (let j = 0; j < this.state.resources; j++) {
        output += `${this.state.allocation[i][j].toString().padStart(2)} `;
      }
      output += '\n';
    }

    output += '\nMax Matrix:\n';
    output += '    ';
    for (let j = 0; j < this.state.resources; j++) {
      output += `R${j}  `;
    }
    output += '\n';
    
    for (let i = 0; i < this.state.processes; i++) {
      output += `P${i}  `;
      for (let j = 0; j < this.state.resources; j++) {
        output += `${this.state.max[i][j].toString().padStart(2)} `;
      }
      output += '\n';
    }

    output += '\nNeed Matrix:\n';
    output += '    ';
    for (let j = 0; j < this.state.resources; j++) {
      output += `R${j}  `;
    }
    output += '\n';
    
    for (let i = 0; i < this.state.processes; i++) {
      output += `P${i}  `;
      for (let j = 0; j < this.state.resources; j++) {
        output += `${this.state.need[i][j].toString().padStart(2)} `;
      }
      output += '\n';
    }

    output += `\nAvailable: [${this.state.available.join(', ')}]\n`;
    
    return output;
  }
}

// Example usage and test cases
export function createExampleScenario(): BankersAlgorithm {
  // Classic Banker's Algorithm example
  const processes = 5;
  const resources = 3;
  
  const allocation = [
    [0, 1, 0], // P0
    [2, 0, 0], // P1
    [3, 0, 2], // P2
    [2, 1, 1], // P3
    [0, 0, 2]  // P4
  ];
  
  const max = [
    [7, 5, 3], // P0
    [3, 2, 2], // P1
    [9, 0, 2], // P2
    [2, 2, 2], // P3
    [4, 3, 3]  // P4
  ];
  
  const available = [3, 3, 2];
  
  return new BankersAlgorithm(processes, resources, allocation, max, available);
}

export function createDeadlockScenario(): BankersAlgorithm {
  // Scenario that leads to unsafe state
  const processes = 3;
  const resources = 2;
  
  const allocation = [
    [1, 0], // P0
    [0, 1], // P1
    [1, 1]  // P2
  ];
  
  const max = [
    [2, 1], // P0
    [1, 2], // P1
    [2, 2]  // P2
  ];
  
  const available = [0, 0]; // No resources available
  
  return new BankersAlgorithm(processes, resources, allocation, max, available);
}