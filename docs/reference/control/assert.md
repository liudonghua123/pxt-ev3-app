# assert

Display an error number and stop the program if the assertion condition is false.

```sig
control.assert(false, 0)
```

You can insist that your program will stop at an assert block if a certain condition you check is false. The error number in the assert is written to the serial port with a failure message.

## Parameters

* **cond**: a [boolean](/types/boolean) where true means everything is ok or false which means, stop the program!
* **code**: an error [number](/types/number) you match to an error situation in your program.

## Example #example

Stop the program if the gyro dectects an angle greater than 45 degrees.

```blocks
forever(function () {
    control.assert(sensors.gyro2.angle() > 45, 15)
    pause(300)
})
```
## See also #seealso

[panic](/reference/control/panic)

```package
base
```
