#!/bin/bash

# Test all language containers

echo "Testing Online Judge language containers..."

# Test Python
echo "Testing Python container..."
echo 'print("Hello from Python!")' > test.py
docker run --rm -v $(pwd):/workspace oj-python:3.9 python test.py
rm test.py

# Test JavaScript
echo "Testing JavaScript container..."
echo 'console.log("Hello from JavaScript!");' > test.js
docker run --rm -v $(pwd):/workspace oj-javascript:18 node test.js
rm test.js

# Test C++
echo "Testing C++ container..."
echo '#include<iostream>
int main(){std::cout<<"Hello from C++!"<<std::endl;return 0;}' > test.cpp
docker run --rm -v $(pwd):/workspace oj-cpp:9 sh -c "g++ -o test test.cpp && ./test"
rm test.cpp test 2>/dev/null

# Test Java
echo "Testing Java container..."
echo 'public class Test{public static void main(String[] args){System.out.println("Hello from Java!");}}' > Test.java
docker run --rm -v $(pwd):/workspace oj-java:11 sh -c "javac Test.java && java Test"
rm Test.java Test.class 2>/dev/null

# Test C
echo "Testing C container..."
echo '#include<stdio.h>
int main(){printf("Hello from C!\n");return 0;}' > test.c
docker run --rm -v $(pwd):/workspace oj-c:9 sh -c "gcc -o test test.c && ./test"
rm test.c test 2>/dev/null

echo "All container tests completed!"
