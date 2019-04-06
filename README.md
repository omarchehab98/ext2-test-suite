# EXT2 Commands Test Suite

## Summary

Automated blackbox test suite for extended filesystem 2 commands `ext2_checker`, `ext2_cp`, `ext2_ln`,
`ext2_mkdir`, `ext2_restore`, and `ext2_rm`.

Test runner handles copying the file system image, running the test based on a JSON file, and diffing the result with the expected result.

Writing a test is as simple as creating a 3 line JSON file or as complex as writing a custom `ext2_dump` command and setting up a disk image's state. What I am trying to say is that you are not limited to writing simple/naive tests.

## Usage

```
ln -s /path/to/ext2/bin ./src/bin
npm install
npm test
```

![Screenshot of test suite](https://user-images.githubusercontent.com/12089120/55671628-15f51a00-5860-11e9-8212-aa7ddcd32d4a.png)

## Writing tests

1. Create folder in `src/tests` named as the command that will be tested in `src/bin` (e.g. `ext2_mkdir`)
2. Create `0.json` file in `src/tests/ext2_mkdir`
    * `description` (_optional_): test message that will print to the console when running the tests.
    * `image` (_required_): filename of the disk image in `src/fixtures/images` that the command will run on.
    * `args` (_optional_): an array of arguments that will be passed after the `image` arg.
    * `preargs` (_optional_): an array of arguments that will be passed before the `image` arg.
    * `only` (_optional_): a boolean which when `true` makes only this test run.
    * `skip` (_optional_): a boolean which when `true` makes this test not run.

    ```js
    {
      "description": "should create directory entry in /",
      "image": "emptydisk.img",
      "args": ["/afile"]
    }
    ```

3. `npm test` to run the test suite, the test runner will run the test but does not have a snapshot to diff against, so it will fail

4. `src/runs/ext2_mkdir/0.out` will contain the result of the run
    * Inspect it, edit if the expected answer is different

    * Copy it to `src/tests/ext2_mkdir/0.ans` so that subsequent runs can be diffed against it to catch regressions

    * `<CODE>` is the process exit code.
    * `<STDOUT>` is followed by the expected standard output of the program.
    * `<STDERR>` is followed by the expected standard error of the program.
    * `<IMAGE>` is followed by the standard output of running `src/bin/ext2_dump` on the image after the test case was run.


    ```
    <CODE> 0
    <STDOUT>

    <STDERR>

    <IMAGE>
    Inodes: 32
    Blocks: 128
    Block group:
        block bitmap: 3
        inode bitmap: 4
        inode table: 5
        free blocks: 104
        free inodes: 20
        used_dirs: 3
    Block bitmap: 11111111 11111111 11111110 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000001
    Inode bitmap: 11111111 11110000 00000000 00000000

    Inodes:
    [2] type: d size: 1024 links: 4 blocks: 2
    [2] Blocks:  9
    [12] type: d size: 1024 links: 2 blocks: 2
    [12] Blocks:  23

    Directory Blocks:
      DIR BLOCK NUM: 9 (for inode 2)
    Inode: 2 rec_len: 12 name_len: 1 type= d name=.
    Inode: 2 rec_len: 12 name_len: 2 type= d name=..
    Inode: 11 rec_len: 20 name_len: 10 type= d name=lost+found
    Inode: 12 rec_len: 980 name_len: 5 type= d name=afile
      DIR BLOCK NUM: 23 (for inode 12)
    Inode: 12 rec_len: 12 name_len: 1 type= d name=.
    Inode: 2 rec_len: 1012 name_len: 2 type= d name=..
    ```

## Resources

* https://www.nongnu.org/ext2-doc/ext2.html
* https://wiki.osdev.org/Ext2
