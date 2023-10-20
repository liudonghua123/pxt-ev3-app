# run In Parallel

Run some other code at the same time that your main program code runs.

```sig
control.runInParallel(() => {})
```

Sometimes you want your program to work on more than one thing at a time. The main part of your program is
always put in [``||on start||``](/blocks/on-start). But, you can also put some other part of your
program in ``||control:run in parallel||``. This is useful when you want your program to keep doing important things
and you don't want to wait for some other actions to happen first.

## Separate tasks #tasks

As an example, you could have a small task that checks the battery level and gives a warning when it drops below 15 percent. This is placed inside a ``||control:run in parallel||`` block:

```block
let powerCheck = false;

control.runInParallel(() => {
    while (!powerCheck) {
        if (brick.batteryLevel() <= 15) {
            brick.setStatusLight(StatusLight.RedFlash)
            powerCheck = true;
        } else {
            pause(5000);
        }
    }
})
```

The code the main program just drives the brick in a constant pattern until the battery check in the parallel task says that the battery level is too low.

```block
let powerCheck = false;
while (!powerCheck) {
    motors.largeBC.tank(50, 50, 5, MoveUnit.Seconds)
    motors.largeBC.steer(5, 50, 6, MoveUnit.Rotations)
}
motors.stopAll()
```

## Parameters

* **a**: the code to run in the background.

## Example #example

Tank the brick in a pattern until the battery warning variable is set. Have a separate task check the battery level and set a warning variable when the level is below `5` percent.

```blocks
let powerCheck = false;

control.runInParallel(() => {
    while (!powerCheck) {
        if (brick.batteryLevel() < 5) {
            powerCheck = true;
        } else {
            pause(5000);
        }
    }
})

while (!powerCheck) {
    motors.largeBC.tank(20, 20, 5, MoveUnit.Seconds)
    motors.largeBC.steer(15, 20, 6, MoveUnit.Rotations)
    motors.largeBC.tank(40, 40, 5, MoveUnit.Seconds)
    motors.largeBC.steer(-10, 20, 3, MoveUnit.Rotations)
}
motors.stopAll()
```

## See also #seealso

[forever](/reference/loops/forever)
