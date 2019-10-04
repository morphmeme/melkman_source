// for testing
use triangulation::{Polygon, Point};

fn main() {
    let mut test = Polygon::new(vec![Point(0.0, 0.0), Point(0.0, 1.0), Point(1.0, 1.0), Point(0.1, 0.8)]);
    dbg!(test.melkmans_output());
}