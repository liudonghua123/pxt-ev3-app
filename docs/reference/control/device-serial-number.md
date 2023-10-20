# device Serial Number

Get the serial number for the @boardname@

```sig
control.deviceSerialNumber()
```

The system software in your board creates a unique number to identify the board. You can use this number in your program if you want to know which board is running your program.

## Returns

* a [number](/types/number) that is created to uniquely identify this board.

## Example #example

Log the device serial number to the console.

```blocks
console.logValue("serialnumber", control.deviceSerialNumber());
```
## See also #seealso

[device dal version](/reference/control/device-dal-version)
