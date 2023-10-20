# wait Micros

Make the part of the program running right now wait for some number of microseconds.

```sig
control.waitMicros(10)
```
The code inside the current block, such as a ``||on start||``, ``||control:run in parallel||``, and 
``||control:on event||`` , waits for some amount of time. The time number is in microseconds (one-millionth of a second).

## Parameters

* **micros**: the [number](/types/number) of microseconds for this block of code to wait for.

## Example #example

Use a wait and the timer to generate a number.

```blocks
let something = 0
for (let i = 0; i < 100; i++) {
    control.waitMicros(100)
    something = control.millis()
    something += control.deviceSerialNumber()
    if (something != 0) {
        something = something / 1000000
    }
}
```
## #seealso
